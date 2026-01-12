import GlobalNav from "../../components/GlobalNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[420px] px-4 pb-24">
      {children}
      <GlobalNav />
    </div>
  );
}
