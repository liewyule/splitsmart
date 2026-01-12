import TripHeader from "../../../components/TripHeader";
import CreateTripForm from "./CreateTripForm";

export default function CreateTripPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[420px] px-5 pb-24">
      <TripHeader title="Create Trip" backHref="/" />
      <div className="card p-6">
        <CreateTripForm />
      </div>
    </main>
  );
}
