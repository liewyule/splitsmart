export default function TripDashboardLoading() {
  return (
    <div className="py-6">
      <div className="card p-5 space-y-4">
        <div className="space-y-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-6 w-48" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-7 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-6 w-16" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-6 w-20" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="skeleton h-12 w-full rounded-full" />
        <div className="skeleton h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
