"use server";

import { Resend } from "resend";
import { redirect } from "next/navigation";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function prepareAttachments(files: File[]) {
  return Promise.all(
    files
      .filter((file) => file.size > 0)
      .map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
      }))
  );
}

export async function sendContactForm(formData: FormData) {
  const resend = getResend();

  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "");
  const email = String(formData.get("email") || "");
  const message = String(formData.get("message") || "");

  await resend.emails.send({
    from: "DC Joinery <website@dcjoineryni.uk>",
    to: "info@dcjoinery.uk",
    replyTo: email,
    subject: "New Contact Enquiry",
    text: `
New contact enquiry from DC Joinery website

Name: ${name}
Phone: ${phone}
Email: ${email}

Message:
${message}
    `,
  });

  redirect("/thank-you");
}

export async function sendKitchenFittingForm(formData: FormData) {
  const resend = getResend();

  const name = String(formData.get("name") || "");
  const address = String(formData.get("address") || "");
  const phone = String(formData.get("phone") || "");
  const email = String(formData.get("email") || "");
  const kitchenType = String(formData.get("kitchenType") || "");
  const wasteRemoval = String(formData.get("wasteRemoval") || "");
  const supplier = String(formData.get("supplier") || "");
  const worktop = String(formData.get("worktop") || "");
  const otherWorktop = String(formData.get("otherWorktop") || "");
  const installationDate = String(formData.get("installationDate") || "");
  const files = formData.getAll("documents") as File[];
  const attachments = await prepareAttachments(files);

  await resend.emails.send({
    from: "DC Joinery <website@dcjoineryni.uk>",
    to: "info@dcjoinery.uk",
    replyTo: email,
    subject: "New Kitchen Fitting Quote Request",
    attachments,
    text: `
New kitchen fitting quote request

Name: ${name}
Address: ${address}
Phone: ${phone}
Email: ${email}

Kitchen type: ${kitchenType}
Waste removal: ${wasteRemoval}
Supplier: ${supplier}
Worktop: ${worktop}
Other worktop: ${otherWorktop}
Ready for installation: ${installationDate}

Attachments:
${attachments.length > 0 ? attachments.map((a) => a.filename).join(", ") : "No files uploaded"}
    `,
  });

  redirect("/thank-you");
}

export async function sendFitAndSupplyForm(formData: FormData) {
  const resend = getResend();

  const name = String(formData.get("name") || "");
  const address = String(formData.get("address") || "");
  const phone = String(formData.get("phone") || "");
  const email = String(formData.get("email") || "");
  const projectType = String(formData.get("projectType") || "");
  const hasDesign = String(formData.get("hasDesign") || "");
  const supplier = String(formData.get("supplier") || "");
  const message = String(formData.get("message") || "");
  const files = formData.getAll("photos") as File[];
  const attachments = await prepareAttachments(files);

  await resend.emails.send({
    from: "DC Joinery <website@dcjoineryni.uk>",
    to: "info@dcjoinery.uk",
    replyTo: email,
    subject: "New Fit & Supply Consultation Request",
    attachments,
    text: `
New fit & supply consultation request

Name: ${name}
Address: ${address}
Phone: ${phone}
Email: ${email}

Project type: ${projectType}
Already has design: ${hasDesign}
Preferred supplier: ${supplier}

Project description:
${message}

Attachments:
${attachments.length > 0 ? attachments.map((a) => a.filename).join(", ") : "No files uploaded"}
    `,
  });

  redirect("/thank-you");
}