import { redirect } from "next/navigation";

// Profile is a shortcut to settings for now.
export default function ProfilePage() {
  redirect("/console/settings");
}
