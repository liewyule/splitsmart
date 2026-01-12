import TripHeader from "../../../../components/TripHeader";
import JoinTripForm from "./JoinTripForm";
import FadeIn from "../../../../components/FadeIn";

export default function JoinTripPage() {
  return (
    <main className="min-h-screen pb-6">
      <TripHeader title="Join Trip" backHref="/" />
      <FadeIn>
        <JoinTripForm />
      </FadeIn>
    </main>
  );
}
