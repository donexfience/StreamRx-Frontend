import AdminNav from "@/components/admin/AdminNav";
import StreamerNavbar from "@/components/streamer/StreamerNavbar";

export default function StreamerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={` flex w-full`}>
      <StreamerNavbar/>
      {children}
    </div>
  );
}
