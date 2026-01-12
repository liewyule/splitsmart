import GlobalNav from "../../components/GlobalNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[420px] px-4 pb-24">
      {children}
      <GlobalNav />
    </div>
  );
}
