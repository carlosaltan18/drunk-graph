import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/auth";
import { env } from "@/lib/env.server";

const SPRING_BASE_URL = env.SPRING_API_URL.replace(/\/$/, "");

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const reqHeaders = await headers();
  const tokenResult = await adminAuth.api
    .getAccessToken({
      body: { providerId: "fusionauth-admin" },
      headers: reqHeaders,
      returnHeaders: true,
    })
    .catch(() => null);

  const accessToken = tokenResult?.response?.accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized", reason: "session_dead" },
      { status: 401 },
    );
  }

  const { path } = await params;
  const search = request.nextUrl.searchParams.toString();
  const url = `${SPRING_BASE_URL}/${path.join("/")}${search ? `?${search}` : ""}`;

  const contentType = request.headers.get("content-type") ?? "";
  const body =
    request.method !== "GET" ? await request.arrayBuffer() : undefined;

  const upstreamHeaders: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  if (contentType) upstreamHeaders["Content-Type"] = contentType;

  const upstream = await fetch(url, {
    method: request.method,
    headers: upstreamHeaders,
    body: body ? Buffer.from(body) : undefined,
  });

  const upstreamContentType = upstream.headers.get("content-type") ?? "";
  const text = await upstream.text();

  let res: NextResponse;
  if (upstreamContentType.includes("application/json")) {
    const data = text ? JSON.parse(text) : null;
    res = NextResponse.json(data, { status: upstream.status });
  } else {
    res = new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstreamContentType },
    });
  }

  // Forward refreshed cookies (e.g. updated account_data) back to the browser
  tokenResult.headers?.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie")
      res.headers.append("set-cookie", value);
  });

  return res;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
