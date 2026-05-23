import AdminSessionBar from "@/components/admin-session-bar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminSessionBar />
      {children}
    </>
  )
}
