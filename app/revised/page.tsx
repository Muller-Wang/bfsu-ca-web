import ClubExperience from "@/components/brand/ClubExperience";
import { redirect } from "next/navigation";
import { isDemoEnabled } from "@/lib/server/env";

export const dynamic = "force-dynamic";

export default function RevisedPage() {
  if (!isDemoEnabled()) redirect("/");
  return <ClubExperience preview />;
}
