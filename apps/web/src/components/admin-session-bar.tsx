import { auth, adminAuth } from "@/lib/auth"
import { headers } from "next/headers"
import SessionBar from "@/components/session-bar"

export default async function AdminSessionBar() {
  const reqHeaders = await headers()
  const [adminSession, userSession] = await Promise.all([
    adminAuth.api.getSession({ headers: reqHeaders }),
    auth.api.getSession({ headers: reqHeaders }),
  ])

  if (!adminSession) return null

  const logoutUrl = `${process.env.FUSIONAUTH_URL}/oauth2/logout?client_id=${process.env.BACKOFFICE_CLIENT_ID}`

  return (
    <SessionBar
      email={adminSession.user.email}
      role="admin"
      otherSession={userSession ? { email: userSession.user.email, role: "user" } : null}
      logoutUrl={logoutUrl}
    />
  )
}
