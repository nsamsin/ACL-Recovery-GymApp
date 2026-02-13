interface Env {
  DB: D1Database;
}

type Json = Record<string, unknown>;
const attempts = new Map<string, number[]>();

const allowedOrigins = [
  /^https:\/\/([a-z0-9-]+\.)?acl-rehab-app-3rs\.pages\.dev$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/
];

function corsHeadersFor(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const allowOrigin = allowedOrigins.some((re) => re.test(origin))
    ? origin
    : "https://acl-rehab-app-3rs.pages.dev";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,x-user-id",
    Vary: "Origin"
  };
}

function json(request: Request, data: Json, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeadersFor(request) }
  });
}

function randomHex(bytes = 8): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPin(pin: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getUserId(req: Request): string | null {
  return req.headers.get("x-user-id") || new URL(req.url).searchParams.get("user_id");
}

function clientKey(request: Request): string {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ua = request.headers.get("user-agent") || "unknown";
  return `${ip}:${ua.slice(0, 64)}`;
}

function tooManyAttempts(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const list = attempts.get(key) || [];
  const recent = list.filter((ts) => now - ts <= windowMs);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > max;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeadersFor(request) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/api/auth/register" && request.method === "POST") {
        if (tooManyAttempts(`register:${clientKey(request)}`, 5 * 60 * 1000, 20)) {
          return json(request, { error: "Te veel pogingen, probeer later opnieuw" }, 429);
        }
        const body = (await request.json()) as { name?: string; pin?: string };
        const name = body.name?.trim();
        if (!name || !body.pin || !/^\d{4}$/.test(body.pin)) {
          return json(request, { error: "Ongeldige input" }, 400);
        }

        const existingName = await env.DB.prepare("SELECT id FROM users WHERE lower(name) = lower(?) LIMIT 1")
          .bind(name)
          .first();
        if (existingName) {
          return json(request, { error: "Naam bestaat al" }, 409);
        }

        const userId = randomHex(8);
        const shareToken = randomHex(16);
        const pinHash = await hashPin(body.pin);

        await env.DB.prepare("INSERT INTO users (id, name, pin_hash, share_token) VALUES (?, ?, ?, ?)")
          .bind(userId, name, pinHash, shareToken)
          .run();

        const user = await env.DB.prepare("SELECT id, name, share_token FROM users WHERE id = ? LIMIT 1")
          .bind(userId)
          .first();

        return json(request, { user: user || null }, 201);
      }

      if (path === "/api/auth/login" && request.method === "POST") {
        if (tooManyAttempts(`login:${clientKey(request)}`, 5 * 60 * 1000, 30)) {
          return json(request, { error: "Te veel loginpogingen, probeer later opnieuw" }, 429);
        }
        const body = (await request.json()) as { pin?: string; name?: string; user_id?: string };
        if (!body.pin || !/^\d{4}$/.test(body.pin)) return json(request, { error: "Ongeldige PIN" }, 400);

        const pinHash = await hashPin(body.pin);
        let user = null;

        if (body.user_id) {
          user = await env.DB.prepare("SELECT id, name, share_token FROM users WHERE id = ? AND pin_hash = ? LIMIT 1")
            .bind(body.user_id, pinHash)
            .first();
        } else if (body.name?.trim()) {
          user = await env.DB.prepare("SELECT id, name, share_token FROM users WHERE lower(name) = lower(?) AND pin_hash = ? LIMIT 1")
            .bind(body.name.trim(), pinHash)
            .first();
        } else {
          return json(request, { error: "Naam vereist" }, 400);
        }

        if (!user) return json(request, { error: "Naam of PIN onjuist" }, 401);
        return json(request, { user: user as Json });
      }

      if (path === "/api/exercises" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM exercises ORDER BY sort_order ASC").all();
        return json(request, { items: results || [] });
      }

      if (path.startsWith("/api/exercises/") && request.method === "PUT") {
        const id = path.split("/").pop();
        const body = (await request.json()) as { default_weight?: string; note?: string };
        await env.DB.prepare(
          "UPDATE exercises SET default_weight = COALESCE(?, default_weight), note = COALESCE(?, note) WHERE id = ?"
        )
          .bind(body.default_weight ?? null, body.note ?? null, id)
          .run();
        return json(request, { ok: true });
      }

      if (path === "/api/exercises" && request.method === "POST") {
        const body = (await request.json()) as {
          id?: string;
          name?: string;
          category?: string;
          default_sets?: number;
          default_reps?: string;
          default_weight?: string;
          note?: string;
          image_url?: string;
          is_timed?: boolean;
        };

        if (!body.id || !body.name || !body.category) {
          return json(request, { error: "id, name en category zijn verplicht" }, 400);
        }

        const maxSort = await env.DB.prepare("SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM exercises").first<{ max_sort: number }>();
        const sortOrder = Number(maxSort?.max_sort || 0) + 1;

        await env.DB.prepare(
          "INSERT INTO exercises (id, name, category, default_sets, default_reps, default_weight, note, image_url, sort_order, is_timed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
          .bind(
            body.id,
            body.name,
            body.category,
            body.default_sets ?? 2,
            body.default_reps ?? "10",
            body.default_weight ?? "Lichaamsgewicht",
            body.note ?? "",
            body.image_url ?? "/images/c_dead_bugs.svg",
            sortOrder,
            body.is_timed ? 1 : 0
          )
          .run();

        return json(request, { ok: true }, 201);
      }

      if (path === "/api/exercises/reorder" && request.method === "PUT") {
        const body = (await request.json()) as { order?: string[] };
        const order = body.order || [];
        if (!Array.isArray(order) || !order.length) return json(request, { error: "order ontbreekt" }, 400);

        for (let i = 0; i < order.length; i += 1) {
          await env.DB.prepare("UPDATE exercises SET sort_order = ? WHERE id = ?").bind(i + 1, order[i]).run();
        }
        return json(request, { ok: true });
      }

      if (path.startsWith("/api/exercises/") && request.method === "DELETE") {
        const id = path.split("/").pop();
        if (!id) return json(request, { error: "id ontbreekt" }, 400);

        await env.DB.prepare("DELETE FROM exercises WHERE id = ?").bind(id).run();
        await env.DB.prepare("DELETE FROM session_exercises WHERE exercise_id = ?").bind(id).run();
        return json(request, { ok: true });
      }

      if (path === "/api/settings/name" && request.method === "PUT") {
        const userId = getUserId(request);
        if (!userId) return json(request, { error: "Geen user id" }, 401);
        const body = (await request.json()) as { name?: string };
        const newName = body.name?.trim();
        if (!newName) return json(request, { error: "Naam ontbreekt" }, 400);

        const exists = await env.DB.prepare("SELECT id FROM users WHERE lower(name) = lower(?) AND id != ? LIMIT 1")
          .bind(newName, userId)
          .first();
        if (exists) return json(request, { error: "Naam bestaat al" }, 409);

        await env.DB.prepare("UPDATE users SET name = ? WHERE id = ?").bind(newName, userId).run();
        const user = await env.DB.prepare("SELECT id, name, share_token FROM users WHERE id = ?")
          .bind(userId)
          .first();
        return json(request, { user: user as Json });
      }

      if (path === "/api/settings/pin" && request.method === "PUT") {
        const userId = getUserId(request);
        if (!userId) return json(request, { error: "Geen user id" }, 401);
        const body = (await request.json()) as { current_pin?: string; new_pin?: string };
        if (!body.current_pin || !body.new_pin || !/^\d{4}$/.test(body.current_pin) || !/^\d{4}$/.test(body.new_pin)) {
          return json(request, { error: "Ongeldige PIN" }, 400);
        }

        const currentHash = await hashPin(body.current_pin);
        const user = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND pin_hash = ? LIMIT 1")
          .bind(userId, currentHash)
          .first();
        if (!user) return json(request, { error: "Huidige PIN onjuist" }, 401);

        const newHash = await hashPin(body.new_pin);
        await env.DB.prepare("UPDATE users SET pin_hash = ? WHERE id = ?").bind(newHash, userId).run();
        return json(request, { ok: true });
      }

      if (path === "/api/sessions" && request.method === "POST") {
        const userId = getUserId(request);
        if (!userId) return json(request, { error: "Geen user id" }, 401);

        const sessionId = randomHex(8);
        const today = new Date().toISOString().slice(0, 10);
        await env.DB.prepare("INSERT INTO sessions (id, user_id, date, started_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)")
          .bind(sessionId, userId, today)
          .run();

        const session = await env.DB.prepare("SELECT * FROM sessions WHERE id = ?").bind(sessionId).first();

        const { results } = await env.DB.prepare("SELECT id, default_sets, default_reps, default_weight FROM exercises").all();
        for (const ex of results || []) {
          const row = ex as Record<string, unknown>;
          await env.DB.prepare(
            "INSERT INTO session_exercises (session_id, exercise_id, sets_completed, reps_completed, weight_used) VALUES (?, ?, ?, ?, ?)"
          )
            .bind(sessionId, row.id, row.default_sets, row.default_reps, row.default_weight)
            .run();
        }

        return json(request, { session: session || null }, 201);
      }

      if (path === "/api/sessions" && request.method === "GET") {
        const userId = getUserId(request);
        if (!userId) return json(request, { error: "Geen user id" }, 401);
        const { results } = await env.DB.prepare(
          "SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC, started_at DESC"
        )
          .bind(userId)
          .all();
        return json(request, { items: results || [] });
      }

      if (path.startsWith("/api/sessions/") && !path.includes("/exercises") && request.method === "PUT") {
        const id = path.split("/")[3];
        const body = (await request.json()) as { notes?: string; completed?: boolean };
        await env.DB.prepare(
          "UPDATE sessions SET notes = COALESCE(?, notes), completed_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id = ?"
        )
          .bind(body.notes ?? null, body.completed ? 1 : 0, id)
          .run();
        return json(request, { ok: true });
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
        if (!body.exercise_id) return json(request, { error: "exercise_id ontbreekt" }, 400);
        await env.DB.prepare(
          "UPDATE session_exercises SET completed = ?, sets_completed = ?, reps_completed = ?, weight_used = ?, notes = ? WHERE session_id = ? AND exercise_id = ?"
        )
          .bind(
            body.completed ? 1 : 0,
            body.sets_completed ?? null,
            body.reps_completed ?? null,
            body.weight_used ?? null,
            body.notes ?? null,
            id,
            body.exercise_id
          )
          .run();
        return json(request, { ok: true });
      }

      if (path === "/api/health-log" && request.method === "POST") {
        const userId = getUserId(request);
        if (!userId) return json(request, { error: "Geen user id" }, 401);
        const body = (await request.json()) as {
          date?: string;
          swelling?: number;
          pain?: number;
          stiffness?: number;
          rom_extension?: boolean;
          rom_flexion_degrees?: number;
          notes?: string;
        };
        await env.DB.prepare(
          "INSERT INTO health_log (user_id, date, swelling, pain, stiffness, rom_extension, rom_flexion_degrees, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
          .bind(
            userId,
            body.date,
            body.swelling,
            body.pain,
            body.stiffness,
            body.rom_extension ? 1 : 0,
            body.rom_flexion_degrees,
            body.notes ?? ""
          )
          .run();
        return json(request, { ok: true }, 201);
      }

      if (path === "/api/health-log" && request.method === "GET") {
        const userId = getUserId(request);
        if (!userId) return json(request, { error: "Geen user id" }, 401);
        const { results } = await env.DB.prepare(
          "SELECT * FROM health_log WHERE user_id = ? ORDER BY date DESC, created_at DESC"
        )
          .bind(userId)
          .all();
        return json(request, { items: results || [] });
      }

      if (path.startsWith("/api/share/") && request.method === "GET") {
        const token = path.split("/").pop();
        const user = await env.DB.prepare("SELECT id, name FROM users WHERE share_token = ? LIMIT 1")
          .bind(token)
          .first();
        if (!user) return json(request, { error: "Ongeldige token" }, 404);

        const uid = (user as Record<string, string>).id;
        const sessions = await env.DB.prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC")
          .bind(uid)
          .all();
        const health = await env.DB.prepare(
          "SELECT date, swelling, pain, stiffness, rom_extension, rom_flexion_degrees, notes FROM health_log WHERE user_id = ? ORDER BY date DESC"
        )
          .bind(uid)
          .all();
        const sessionExercises = await env.DB.prepare(
          "SELECT se.session_id, se.exercise_id, e.name AS exercise_name, e.category, se.completed, se.sets_completed, se.reps_completed, se.weight_used, se.notes FROM session_exercises se JOIN sessions s ON s.id = se.session_id JOIN exercises e ON e.id = se.exercise_id WHERE s.user_id = ? ORDER BY s.date DESC"
        )
          .bind(uid)
          .all();

        return json(request, {
          user,
          sessions: sessions.results || [],
          healthLog: health.results || [],
          sessionExercises: sessionExercises.results || []
        });
      }

      if (path.startsWith("/api/progress/") && request.method === "GET") {
        const userId = getUserId(request);
        if (!userId) return json(request, { error: "Geen user id" }, 401);
        const exerciseId = path.split("/").pop();
        const { results } = await env.DB.prepare(
          "SELECT s.date, se.weight_used, se.reps_completed FROM session_exercises se JOIN sessions s ON s.id = se.session_id WHERE s.user_id = ? AND se.exercise_id = ? ORDER BY s.date ASC"
        )
          .bind(userId, exerciseId)
          .all();
        return json(request, { items: results || [] });
      }

      return json(request, { error: "Route niet gevonden" }, 404);
    } catch (e) {
      return json(request, { error: "Serverfout", detail: String(e) }, 500);
    }
  }
};
