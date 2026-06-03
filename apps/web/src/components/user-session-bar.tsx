import { headers } from "next/headers";
import SessionBar from "@/components/session-bar";
import { adminAuth, auth } from "@/lib/auth";

export default async function UserSessionBar() {
  const reqHeaders = await headers();
  const [userSession, adminSession] = await Promise.all([
    auth.api.getSession({ headers: reqHeaders }),
    adminAuth.api.getSession({ headers: reqHeaders }),
  ]);

  if (!userSession) return null;

  return (
    <SessionBar
      email={userSession.user.email}
      userRole="user"
      otherSession={
        adminSession
          ? { email: adminSession.user.email, userRole: "admin" }
          : null
      }
    />
  );
}
