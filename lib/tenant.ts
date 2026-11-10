import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { memberships, organizations, type Role } from "@/db/schema";

export async function requireOrgAccess(
  slug: string,
  allowed: Role[] = ["owner", "admin", "member"],
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const [row] = await db
    .select({ org: organizations, role: memberships.role })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .where(and(eq(organizations.slug, slug), eq(memberships.userId, session.user.id)))
    .limit(1);

  // Not a member OR wrong role -> 404, so outsiders can't even confirm the org exists
  if (!row || !allowed.includes(row.role)) notFound();

  return { user: session.user, org: row.org, role: row.role };
}