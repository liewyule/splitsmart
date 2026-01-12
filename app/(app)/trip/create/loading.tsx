export default function CreateTripLoading() {
  return (
    <div className="min-h-screen pb-6">
      <div className="py-4">
        <div className="skeleton h-6 w-32" />
      </div>
      <div className="card p-6 space-y-4">
        <div className="space-y-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-10 w-full rounded-xl" />
        </div>
        <div className="skeleton h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
