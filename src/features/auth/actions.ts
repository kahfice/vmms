"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface AuthActionResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

export async function login(state: AuthActionResponse | null, formData: FormData): Promise<AuthActionResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password harus diisi" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const user = data.user;
  if (user) {
    // Sync to Prisma User DB
    try {
      await db.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email || "",
          name: user.user_metadata?.name || user.email?.split("@")[0],
        },
        create: {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || user.email?.split("@")[0],
        },
      });
    } catch (e) {
      console.error("Failed to sync logged in user to database:", e);
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signup(state: AuthActionResponse | null, formData: FormData): Promise<AuthActionResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return { error: "Semua kolom input harus diisi" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  const user = data.user;
  if (user) {
    // Sync to Prisma User DB
    try {
      await db.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email || "",
          name,
        },
        create: {
          id: user.id,
          email: user.email || "",
          name,
        },
      });
    } catch (e) {
      console.error("Failed to sync signed up user to database:", e);
    }
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Pendaftaran berhasil! Silakan masuk." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}
