"use client";
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
export type FormState = { error: string } | null;
function Fields({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return <fieldset disabled={pending} className="contents">{children}{pending && <p role="status">Sending your enquiry…</p>}</fieldset>;
}
export default function EnquiryForm({ action, children, className }: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode; className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return <form action={formAction} className={className}>
    {state?.error && <p role="alert" className="rounded-xl border border-red-400 p-4 text-red-200">{state.error}</p>}
    <Fields>{children}</Fields>
    <p className="text-sm text-neutral-400">We use your details to respond to your enquiry. <a className="underline" href="/privacy">Privacy notice</a>.</p>
  </form>;
}
