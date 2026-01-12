import TripHeader from "../../../components/TripHeader";
import JoinTripForm from "./JoinTripForm";

export default function JoinTripPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[420px] px-5 pb-24">
      <TripHeader title="Join Trip" backHref="/" />
      <JoinTripForm />
    </main>
  );
}
