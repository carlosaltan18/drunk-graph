type AnyAuthInstance = {
  api: {
    getAccessToken: (opts: {
      body: { providerId: string };
      headers: Headers;
      returnHeaders: true;
    }) => Promise<unknown>;
  };
};

// Per-auth-instance map of sessionToken → in-flight refresh promise.
// Coalesces concurrent requests that race to refresh the same token,
// preventing FusionAuth from seeing multiple rotations of the same refresh token.
const inflightByAuth = new WeakMap<
  AnyAuthInstance,
  Map<
    string,
    Promise<{ headers: Headers; response: { accessToken?: string } } | null>
  >
>();

function getInflightMap(authInstance: AnyAuthInstance) {
  let map = inflightByAuth.get(authInstance);
  if (!map) {
    map = new Map();
    inflightByAuth.set(authInstance, map);
  }
  return map;
}

export async function getAccessToken(
  authInstance: AnyAuthInstance,
  providerId: string,
  reqHeaders: Headers,
) {
  // Use the session token as the dedup key — requests from the same browser
  // session share the same account_data cookie and would race to refresh.
  const cookieHeader = reqHeaders.get("cookie") ?? "";
  const sessionTokenMatch = cookieHeader.match(
    /ba-(?:user|admin)\.session_token=([^;]+)/,
  );
  const dedupeKey = sessionTokenMatch?.[1] ?? cookieHeader;

  const inflight = getInflightMap(authInstance);

  const existing = inflight.get(dedupeKey);
  if (existing) {
    return existing;
  }

  const promise = (
    authInstance.api.getAccessToken({
      body: { providerId },
      headers: reqHeaders,
      returnHeaders: true,
    }) as Promise<{ headers: Headers; response: { accessToken?: string } }>
  )
    .catch((err: unknown) => {
      console.error(
        "[proxy] getAccessToken threw:",
        (err as { status?: string })?.status,
        (err as { message?: string })?.message,
        (err as { body?: unknown })?.body,
      );
      return null;
    })
    .finally(() => {
      inflight.delete(dedupeKey);
    });

  inflight.set(dedupeKey, promise);
  return promise;
}
