import TripHeader from "../../../../components/TripHeader";
import JoinTripForm from "./JoinTripForm";

export default function JoinTripPage() {
  return (
    <main className="min-h-screen pb-6">
      <TripHeader title="Join Trip" backHref="/" />
      <JoinTripForm />
    </main>
  );
}

