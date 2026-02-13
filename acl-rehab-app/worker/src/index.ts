interface Env {
  DB: D1Database;
}

type Json = Record<string, unknown>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,x-user-id"
};

function json(data: Json, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

async function hashPin(pin: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getUserId(req: Request): string | null {
  return req.headers.get("x-user-id") || new URL(req.url).searchParams.get("user_id");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/api/auth/register" && request.method === "POST") {
        const body = (await request.json()) as { name?: string; pin?: string };
        if (!body.name || !body.pin || !/^\d{4}$/.test(body.pin)) return json({ error: "Ongeldige input" }, 400);

        const pin_hash = await hashPin(body.pin);
        await env.DB.prepare("INSERT INTO users (name, pin_hash) VALUES (?, ?)").bind(body.name, pin_hash).run();
        const user = await env.DB.prepare("SELECT id, name, share_token FROM users ORDER BY created_at DESC LIMIT 1").first();
        return json({ user: user || null }, 201);
      }

      if (path === "/api/auth/login" && request.method === "POST") {
        const body = (await request.json()) as { pin?: string };
        if (!body.pin || !/^\d{4}$/.test(body.pin)) return json({ error: "Ongeldige PIN" }, 400);
        const pin_hash = await hashPin(body.pin);
        const user = await env.DB.prepare("SELECT id, name, share_token FROM users WHERE pin_hash = ? LIMIT 1").bind(pin_hash).first();
        if (!user) return json({ error: "PIN onjuist" }, 401);
        return json({ user });
      }

      if (path === "/api/exercises" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM exercises ORDER BY sort_order ASC").all();
        return json({ items: results || [] });
      }

      if (path.startsWith("/api/exercises/") && request.method === "PUT") {
        const id = path.split("/").pop();
        const body = (await request.json()) as { default_weight?: string; note?: string };
        await env.DB.prepare("UPDATE exercises SET default_weight = COALESCE(?, default_weight), note = COALESCE(?, note) WHERE id = ?")
          .bind(body.default_weight ?? null, body.note ?? null, id)
          .run();
        return json({ ok: true });
      }

      if (path === "/api/sessions" && request.method === "POST") {
        const userId = getUserId(request);
        if (!userId) return json({ error: "Geen user id" }, 401);

        const today = new Date().toISOString().slice(0, 10);
        await env.DB.prepare("INSERT INTO sessions (user_id, date, started_at) VALUES (?, ?, CURRENT_TIMESTAMP)").bind(userId, today).run();
        const session = await env.DB.prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 1").bind(userId).first();
        if (session) {
          const { results } = await env.DB.prepare("SELECT id, default_sets, default_reps, default_weight FROM exercises").all();
          for (const ex of results || []) {
            await env.DB.prepare("INSERT INTO session_exercises (session_id, exercise_id, sets_completed, reps_completed, weight_used) VALUES (?, ?, ?, ?, ?)")
              .bind((session as any).id, (ex as any).id, (ex as any).default_sets, (ex as any).default_reps, (ex as any).default_weight)
              .run();
          }
        }
        return json({ session: session || null }, 201);
      }

      if (path === "/api/sessions" && request.method === "GET") {
        const userId = getUserId(request);
        if (!userId) return json({ error: "Geen user id" }, 401);
        const { results } = await env.DB.prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC, started_at DESC").bind(userId).all();
        return json({ items: results || [] });
      }

      if (path.startsWith("/api/sessions/") && !path.includes("/exercises") && request.method === "PUT") {
        const id = path.split("/")[3];
        const body = (await request.json()) as { notes?: string; completed?: boolean };
        await env.DB.prepare("UPDATE sessions SET notes = COALESCE(?, notes), completed_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id = ?")
          .bind(body.notes ?? null, body.completed ? 1 : 0, id)
          .run();
        return json({ ok: true });
      }

      if (path.match(/^\/api\/sessions\/[^/]+\/exercises$/) && request.method === "POST") {
        const id = path.split("/")[3];
        const body = (await request.json()) as {
          exercise_id?: string;
          completed?: boolean;
          sets_completed?: number;
          reps_completed?: string;
          weight_used?: string;
          notes?: string;
        };
        if (!body.exercise_id) return json({ error: "exercise_id ontbreekt" }, 400);
        await env.DB.prepare(
          "UPDATE session_exercises SET completed = ?, sets_completed = ?, reps_completed = ?, weight_used = ?, notes = ? WHERE session_id = ? AND exercise_id = ?"
        )
          .bind(body.completed ? 1 : 0, body.sets_completed ?? null, body.reps_completed ?? null, body.weight_used ?? null, body.notes ?? null, id, body.exercise_id)
          .run();
        return json({ ok: true });
      }

      if (path === "/api/health-log" && request.method === "POST") {
        const userId = getUserId(request);
        if (!userId) return json({ error: "Geen user id" }, 401);
        const body = (await request.json()) as any;
        await env.DB.prepare(
          "INSERT INTO health_log (user_id, date, swelling, pain, stiffness, rom_extension, rom_flexion_degrees, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
          .bind(userId, body.date, body.swelling, body.pain, body.stiffness, body.rom_extension ? 1 : 0, body.rom_flexion_degrees, body.notes ?? "")
          .run();
        return json({ ok: true }, 201);
      }

      if (path === "/api/health-log" && request.method === "GET") {
        const userId = getUserId(request);
        if (!userId) return json({ error: "Geen user id" }, 401);
        const { results } = await env.DB.prepare("SELECT * FROM health_log WHERE user_id = ? ORDER BY date DESC, created_at DESC").bind(userId).all();
        return json({ items: results || [] });
      }

      if (path.startsWith("/api/share/") && request.method === "GET") {
        const token = path.split("/").pop();
        const user = await env.DB.prepare("SELECT id, name FROM users WHERE share_token = ? LIMIT 1").bind(token).first();
        if (!user) return json({ error: "Ongeldige token" }, 404);
        const sessions = await env.DB.prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC").bind((user as any).id).all();
        const health = await env.DB.prepare("SELECT date, swelling, pain, stiffness, rom_extension, rom_flexion_degrees, notes FROM health_log WHERE user_id = ? ORDER BY date DESC").bind((user as any).id).all();
        return json({ user, sessions: sessions.results || [], healthLog: health.results || [] });
      }

      if (path.startsWith("/api/progress/") && request.method === "GET") {
        const userId = getUserId(request);
        if (!userId) return json({ error: "Geen user id" }, 401);
        const exerciseId = path.split("/").pop();
        const { results } = await env.DB.prepare(
          "SELECT s.date, se.weight_used, se.reps_completed FROM session_exercises se JOIN sessions s ON s.id = se.session_id WHERE s.user_id = ? AND se.exercise_id = ? ORDER BY s.date ASC"
        )
          .bind(userId, exerciseId)
          .all();
        return json({ items: results || [] });
      }

      return json({ error: "Route niet gevonden" }, 404);
    } catch (e) {
      return json({ error: "Serverfout", detail: String(e) }, 500);
    }
  }
};
