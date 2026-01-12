export default function Loading() {
  return (
    <div className="page-container min-h-screen py-10">
      <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-200/70" />
      <div className="mt-6 space-y-4">
        <div className="h-24 animate-pulse rounded-xl bg-slate-200/70" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-200/70" />
      </div>
    </div>
  );
}
