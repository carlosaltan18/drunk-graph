import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const SPRING_BASE_URL = process.env.SPRING_API_URL

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { path } = await params
  const search = request.nextUrl.searchParams.toString()
  const url = `${SPRING_BASE_URL}/api/${path.join("/")}${search ? `?${search}` : ""}`

  const body = request.method !== "GET" ? await request.text() : undefined

  const upstream = await fetch(url, {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.session.token}`,
    },
    body,
  })

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
