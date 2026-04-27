import { redirect } from "next/navigation";

/**
 * /intake/bulk has been merged into /intake (Phase 32 unification —
 * a single intake page now handles one booking or many). This stub
 * redirects old bookmarks.
 */
export default function BulkIntakeRedirect(): never {
  redirect("/intake");
}
