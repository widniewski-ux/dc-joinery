"use server";

import { Resend } from "resend";
import { redirect } from "next/navigation";

export async function sendContactForm(formData: FormData) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "");
  const email = String(formData.get("email") || "");
  const message = String(formData.get("message") || "");

  const result = await resend.emails.send({
    from: "DC Joinery <website@dcjoineryni.uk>",
    to: "info@dcjoinery.uk",
    replyTo: email,
    subject: "New contact form enquiry",
    text: `
New enquiry from DC Joinery website

Name: ${name}
Phone: ${phone}
Email: ${email}

Message:
${message}
    `,
  });

  console.log("RESEND RESULT:", result);

  if (result.error) {
    console.error("RESEND ERROR:", result.error);
    redirect("/contact?error=message-not-sent");
  }

  redirect("/thank-you");
}