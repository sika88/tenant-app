"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { memberships, organizations } from "@/db/schema";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function createOrganization(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) throw new Error("Name is too short");

  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
  const orgId = crypto.randomUUID();

  // batch = both inserts succeed or both fail (the neon-http driver has no transactions)
  await db.batch([
    db.insert(organizations).values({ id: orgId, name, slug }),
    db.insert(memberships).values({ orgId, userId: session.user.id, role: "owner" }),
  ]);

  redirect(`/${slug}`);
}