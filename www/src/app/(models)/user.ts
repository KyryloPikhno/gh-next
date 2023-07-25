import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDBClient } from "~/lib/db";
import { users } from "~/lib/db/schema/user";

/**
 * Find or create the corresponding user in DB from their github profile
 * @param ghUser
 * @returns
 */
export async function getUserFromGithubProfile(
  ghUser: z.TypeOf<typeof githubUserSchema>
) {
  const db = await getDBClient();
  return await db
    .insert(users)
    .values({
      github_id: ghUser.id.toString(),
      username: ghUser.login,
      avatar_url: ghUser.avatar_url,
    })
    .onConflictDoUpdate({
      target: users.github_id,
      set: {
        avatar_url: ghUser.avatar_url,
      },
    })
    .returning()
    .execute();
}

/**
 * get user by username, this function is case insensitive
 * @param username
 * @returns
 */
export async function getUserByUsername(username: string) {
  const lowered = username.toLowerCase();
  const db = await getDBClient();
  return await db
    .select({
      username: users.username,
    })
    .from(users)
    .where(sql`lower(${users.username}) = ${lowered}`)
    .execute();
}

export async function updateUserUsername(username: string, id: number) {
  const db = await getDBClient();
  return await db
    .update(users)
    .set({
      username,
    })
    .where(eq(users.id, id))
    .returning()
    .execute();
}

export const githubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  avatar_url: z.string(),
});
