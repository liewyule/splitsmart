export default function Loading() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[420px] px-5 py-10">
      <div className="h-8 w-40 animate-pulse rounded bg-accentSoft" />
      <div className="mt-6 space-y-4">
        <div className="h-24 animate-pulse rounded-xl bg-accentSoft" />
        <div className="h-24 animate-pulse rounded-xl bg-accentSoft" />
      </div>
    </div>
  );
}
