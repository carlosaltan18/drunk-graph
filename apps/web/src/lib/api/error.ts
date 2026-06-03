export type ApiErrorReason =
  | "session_dead" // BetterAuth has no token to give — refresh token gone or cookie missing
  | "token_rejected" // Spring rejected the JWT — wrong issuer, clock skew, key rotation
  | "http_error"; // any other non-2xx

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly reason: ApiErrorReason = "http_error",
  ) {
    super(`${statusCode}: ${message}`);
    this.name = "ApiError";
  }
}

export async function throwIfError(response: Response): Promise<void> {
  if (response.ok) return;
  if (response.status === 401) {
    const body = await response
      .clone()
      .json()
      .catch(() => ({}));
    const reason: ApiErrorReason =
      body?.reason === "session_dead" ? "session_dead" : "token_rejected";
    throw new ApiError(401, response.statusText, reason);
  }
  throw new ApiError(response.status, response.statusText);
}
