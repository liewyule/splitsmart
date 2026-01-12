import TripHeader from "../../../../components/TripHeader";
import CreateTripForm from "./CreateTripForm";
import FadeIn from "../../../../components/FadeIn";

export default function CreateTripPage() {
  return (
    <main className="min-h-screen pb-6">
      <TripHeader title="Create Trip" backHref="/" />
      <FadeIn>
        <div className="card p-6">
          <CreateTripForm />
        </div>
      </FadeIn>
    </main>
  );
}
