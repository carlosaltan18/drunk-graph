import { headers } from "next/headers";
import SessionBar from "@/components/session-bar";
import { adminAuth, auth } from "@/lib/auth";

export default async function AdminSessionBar() {
  const reqHeaders = await headers();
  const [adminSession, userSession] = await Promise.all([
    adminAuth.api.getSession({ headers: reqHeaders }),
    auth.api.getSession({ headers: reqHeaders }),
  ]);

  if (!adminSession) return null;

  return (
    <SessionBar
      email={adminSession.user.email}
      userRole="admin"
      otherSession={
        userSession ? { email: userSession.user.email, userRole: "user" } : null
      }
    />
  );
}
