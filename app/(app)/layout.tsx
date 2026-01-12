import GlobalNav from "../../components/GlobalNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-container min-h-screen pb-24">
      {children}
      <GlobalNav />
    </div>
  );
}
