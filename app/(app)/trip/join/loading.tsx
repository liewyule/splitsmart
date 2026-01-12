export default function JoinTripLoading() {
  return (
    <div className="min-h-screen pb-6">
      <div className="py-4">
        <div className="skeleton h-6 w-28" />
      </div>
      <div className="space-y-6">
        <div className="card p-5 space-y-4">
          <div className="space-y-2">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
        <div className="card p-5 space-y-3">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-3 w-28" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
