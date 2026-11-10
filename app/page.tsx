import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth, signIn, signOut } from "@/auth";
import { db } from "@/db";
import { memberships, organizations } from "@/db/schema";
import { createOrganization } from "./actions";
import { Suspense } from "react";

async function HomeContent() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="p-8">
        <form action={async () => { "use server"; await signIn("github"); }}>
          <button className="rounded bg-black px-4 py-2 text-white">Sign in with GitHub</button>
        </form>
      </main>
    );
  }

  const myOrgs = await db
    .select({ name: organizations.name, slug: organizations.slug, role: memberships.role })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .where(eq(memberships.userId, session.user.id));

  return (
    <main className="mx-auto max-w-xl space-y-6 p-8">
      <h1 className="text-2xl font-bold">Your organizations</h1>
      <ul className="space-y-2">
        {myOrgs.map((o) => (
          <li key={o.slug}>
            <Link className="underline" href={`/${o.slug}`}>{o.name}</Link> ({o.role})
          </li>
        ))}
      </ul>
      <form action={createOrganization} className="flex gap-2">
        <input name="name" placeholder="New organization" className="flex-1 rounded border p-2" required />
        <button className="rounded bg-black px-4 text-white">Create</button>
      </form>
      <form action={async () => { "use server"; await signOut(); }}>
        <button className="text-sm underline">Sign out</button>
      </form>
    </main>
  );
}
export default function Home() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <HomeContent />
    </Suspense>
  );
}