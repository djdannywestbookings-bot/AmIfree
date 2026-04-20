import { signOut } from "./actions";

export default function SettingsPage() {
  return (
    <main className="max-w-screen-lg mx-auto p-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Owner settings. Phase 22 placeholder.
      </p>
      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="rounded border border-neutral-300 py-2 px-4 text-sm hover:bg-neutral-100"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
