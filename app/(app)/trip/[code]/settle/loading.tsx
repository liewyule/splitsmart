export default function SettleLoading() {
  return (
    <div className="py-6">
      <div className="skeleton h-4 w-48" />
      <div className="mt-5 space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="card p-4">
            <div className="skeleton h-4 w-56" />
          </div>
        ))}
      </div>
    </div>
  );
}
