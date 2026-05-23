import { auth, adminAuth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const reqHeaders = await headers()
  const role = request.nextUrl.searchParams.get("role")

  const fusionAuthUrl = process.env.FUSIONAUTH_URL
  const clientId = role === "admin"
    ? process.env.BACKOFFICE_CLIENT_ID
    : process.env.FUSIONAUTH_CLIENT_ID

  const instance = role === "admin" ? adminAuth : auth
  const response = await instance.handler(
    new Request(`${request.nextUrl.origin}/api/auth${role === "admin" ? "/admin" : ""}/sign-out`, {
      method: "POST",
      headers: reqHeaders,
    })
  )

  const redirect = NextResponse.redirect(
    `${fusionAuthUrl}/oauth2/logout?client_id=${clientId}`
  )

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") redirect.headers.append("set-cookie", value)
  })

  return redirect
}
