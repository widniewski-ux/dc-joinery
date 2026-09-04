"use client";

import type { FormEvent, ReactNode } from "react";
import { trackFormSubmit } from "@/lib/analytics";

type LeadCaptureFormProps = {
  formAction: (formData: FormData) => void | Promise<void>;
  formName: string;
  formType: "lead" | "quote" | "contact";
  className?: string;
  children: ReactNode;
};

export default function LeadCaptureForm({
  formAction,
  formName,
  formType,
  className,
  children,
}: LeadCaptureFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    trackFormSubmit(formName, formType);
    return event;
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
