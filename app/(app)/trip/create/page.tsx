import TripHeader from "../../../../components/TripHeader";
import CreateTripForm from "./CreateTripForm";

export default function CreateTripPage() {
  return (
    <main className="min-h-screen pb-6">
      <TripHeader title="Create Trip" backHref="/" />
      <div className="card p-6">
        <CreateTripForm />
      </div>
    </main>
  );
}

