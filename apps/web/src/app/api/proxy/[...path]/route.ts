import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const SPRING_BASE_URL = process.env.SPRING_API_URL

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tokenData = await auth.api.getAccessToken({
    body: { providerId: "fusionauth" },
    headers: reqHeaders,
  })

  const accessToken = tokenData?.accessToken

  if (!accessToken) {
    return NextResponse.json({ error: "No upstream token" }, { status: 401 })
  }

  const { path } = await params
  const search = request.nextUrl.searchParams.toString()
  const url = `${SPRING_BASE_URL}/api/${path.join("/")}${search ? `?${search}` : ""}`

  const body = request.method !== "GET" ? await request.text() : undefined

  const upstream = await fetch(url, {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  })

  const text = await upstream.text()
  const data = text ? JSON.parse(text) : null
  return NextResponse.json(data, { status: upstream.status })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
