import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import NewGameForm from "@/components/NewGameForm";

export default function NewGamePage() {
  if (!isAuthenticated()) {
    redirect("/login?next=/new");
  }

  return <NewGameForm />;
}
