export default function HomeLoading() {
  return (
    <div className="min-h-screen pb-6">
      <div className="flex items-center justify-between pt-6">
        <div className="space-y-2">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-5 w-36" />
        </div>
        <div className="skeleton h-10 w-10 rounded-full" />
      </div>

      <div className="mt-6 space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="skeleton h-12 w-12 rounded-2xl" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-48" />
              </div>
            </div>
            <div className="skeleton h-4 w-4 rounded-full" />
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="skeleton h-12 w-12 rounded-2xl" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-48" />
              </div>
            </div>
            <div className="skeleton h-4 w-4 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
