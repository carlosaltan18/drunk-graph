import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, auth } from "@/lib/auth";
import { env } from "@/lib/env.server";

export async function GET(request: NextRequest) {
  const reqHeaders = await headers();
  const role = request.nextUrl.searchParams.get("role");

  const fusionAuthUrl = env.FUSIONAUTH_URL;
  const clientId =
    role === "admin" ? env.BACKOFFICE_CLIENT_ID : env.FUSIONAUTH_CLIENT_ID;

  const instance = role === "admin" ? adminAuth : auth;
  const response = await instance.handler(
    new Request(
      `${request.nextUrl.origin}/api/auth${role === "admin" ? "/admin" : ""}/sign-out`,
      {
        method: "POST",
        headers: reqHeaders,
      },
    ),
  );

  const redirect = NextResponse.redirect(
    `${fusionAuthUrl}/oauth2/logout?client_id=${clientId}`,
  );

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie")
      redirect.headers.append("set-cookie", value);
  });

  return redirect;
}
