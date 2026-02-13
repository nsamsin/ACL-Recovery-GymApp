export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url);
  const upstreamUrl = new URL(
    `${incomingUrl.pathname}${incomingUrl.search}`,
    "https://acl-rehab-api.hedson-it.workers.dev"
  );

  const proxiedRequest = new Request(upstreamUrl.toString(), context.request);
  return fetch(proxiedRequest);
}
