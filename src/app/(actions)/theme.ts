"use server";

import { z } from "zod";
import { getSession } from "./auth";
import { cache } from "react";
import { updateUserTheme } from "~/app/(models)/user";
import { revalidatePath } from "next/cache";

import { users } from "~/lib/server/db/schema/user.sql";
import { createSelectSchema } from "drizzle-zod";
import { redirect } from "next/navigation";
import { withAuth, type AuthState } from "./middlewares";

const userThemeSchema = createSelectSchema(users).pick({
  preferred_theme: true
});
const themeSchema = userThemeSchema.shape.preferred_theme;

export type Theme = z.TypeOf<typeof themeSchema>;

export const getTheme = cache(async function getTheme() {
  const session = await getSession();

  return session.user?.preferred_theme ?? "system";
});

export const updateTheme = withAuth(async function updateTheme(
  formData: FormData,
  { session, currentUser }: AuthState
) {
  const themeResult = themeSchema.safeParse(formData.get("theme")?.toString());

  if (!themeResult.success) {
    revalidatePath("/settings/appearance");
    await session.addFlash({
      type: "warning",
      message: "Invalid theme provided, please retry"
    });
    return;
  }

  const theme = themeResult.data;

  await updateUserTheme(theme, currentUser.id);
  await session.setUserTheme(theme);

  await session.addFlash({
    type: "success",
    message: `Theme changed to ${theme}`
  });

  revalidatePath("/settings/appearance");
  redirect("/settings/appearance");
});
