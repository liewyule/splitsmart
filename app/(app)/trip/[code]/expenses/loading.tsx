export default function ExpensesLoading() {
  return (
    <div className="py-6">
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-40" />
              </div>
              <div className="skeleton h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton mt-6 h-12 w-full rounded-xl" />
    </div>
  );
}
