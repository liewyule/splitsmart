import BottomNav from "../../../components/BottomNav";

export default function TripLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { code: string };
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[420px] px-5 pb-28">
      {children}
      <BottomNav code={params.code} />
    </div>
  );
}
