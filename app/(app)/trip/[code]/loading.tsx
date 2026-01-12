export default function TripLoading() {
  return (
    <div className="min-h-screen py-6">
      <div className="h-6 w-32 animate-pulse rounded bg-accentSoft" />
      <div className="mt-6 space-y-4">
        <div className="h-28 animate-pulse rounded-xl bg-accentSoft" />
        <div className="h-20 animate-pulse rounded-xl bg-accentSoft" />
        <div className="h-20 animate-pulse rounded-xl bg-accentSoft" />
      </div>
    </div>
  );
}

