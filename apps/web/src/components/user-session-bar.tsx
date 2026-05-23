import { auth, adminAuth } from "@/lib/auth"
import { headers } from "next/headers"
import SessionBar from "@/components/session-bar"

export default async function UserSessionBar() {
  const reqHeaders = await headers()
  const [userSession, adminSession] = await Promise.all([
    auth.api.getSession({ headers: reqHeaders }),
    adminAuth.api.getSession({ headers: reqHeaders }),
  ])

  if (!userSession) return null

  const logoutUrl = `${process.env.FUSIONAUTH_URL}/oauth2/logout?client_id=${process.env.FUSIONAUTH_CLIENT_ID}`

  return (
    <SessionBar
      email={userSession.user.email}
      role="user"
      otherSession={adminSession ? { email: adminSession.user.email, role: "admin" } : null}
      logoutUrl={logoutUrl}
    />
  )
}
