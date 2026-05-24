"use server";

import { redirect } from "next/navigation";

export async function signOutUser() {
  redirect("/api/auth-actions/sign-out?role=user");
}

export async function signOutAdmin() {
  redirect("/api/auth-actions/sign-out?role=admin");
}
