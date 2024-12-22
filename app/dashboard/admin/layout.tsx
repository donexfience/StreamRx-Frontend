import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={` flex w-full`}>
      <AdminNav />
      {children}
    </div>
  );
}
