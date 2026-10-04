"use client";
import { useActionState } from "react";
import { loginAdmin } from "./actions";
export default function Login() {
  const [state, action, pending] = useActionState(loginAdmin, null);
  return <form action={action} className="mx-auto my-16 grid max-w-md gap-5 rounded-2xl border border-white/20 p-8">
    <h1 className="text-3xl font-bold">AI leads — sign in</h1>
    <label htmlFor="admin-password">Access code</label>
    <input id="admin-password" name="password" type="password" autoComplete="current-password" maxLength={512} required className="input" />
    {state?.error && <p role="alert">{state.error}</p>}
    <button disabled={pending} className="rounded-xl bg-amber-400 p-3 font-bold text-black">{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
