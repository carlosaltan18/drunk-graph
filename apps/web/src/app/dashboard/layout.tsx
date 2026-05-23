import UserSessionBar from "@/components/user-session-bar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserSessionBar />
      {children}
    </>
  )
}
