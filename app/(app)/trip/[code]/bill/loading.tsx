export default function BillLoading() {
  return (
    <div className="py-6">
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-4 w-16" />
        </div>
        <div className="flex items-center justify-between">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-4 w-16" />
        </div>
        <div className="flex items-center justify-between">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-5 w-20" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-24" />
              </div>
              <div className="skeleton h-4 w-14" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="skeleton h-5 w-12 rounded-full" />
              <div className="skeleton h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
