import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Root route. Routes authenticated owners to /agenda and unauthenticated
 * visitors to /login so the home URL always lands somewhere meaningful.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/agenda" : "/login");
}
