import TripTabs from "../../../../components/TripTabs";

export default function TripLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { code: string };
}) {
  return (
    <div>
      <TripTabs code={params.code} />
      <div className="px-1 pb-6">{children}</div>
    </div>
  );
}
