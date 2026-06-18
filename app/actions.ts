
"use server";

import { Resend } from "resend";
import { redirect } from "next/navigation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactForm(formData: FormData) {
  const name = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const message = formData.get("message");

  await resend.emails.send({
    from: "DC Joinery <website@dcjoineryni.uk>",
    to: "info@dcjoineryni.uk",
    replyTo: String(email),
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

  redirect("/thank-you");
}