import { Suspense } from "react";
import { requireOrgAccess } from "@/lib/tenant";

async function OrgContent({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { org, role, user } = await requireOrgAccess(orgSlug);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{org.name}</h1>
      <p>
        Signed in as {user.name}. Your role: {role}
      </p>
    </main>
  );
}

export default function OrgPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <OrgContent params={params} />
    </Suspense>
  );
}