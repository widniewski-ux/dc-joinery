"use server";

import { Resend } from "resend";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkedAttachments } from "@/lib/uploads";
import { RequestError } from "@/lib/security";
import { assertRateLimit, getRequestIdentifier } from "@/lib/ai-designer/rate-limit";
import type { FormState } from "./components/EnquiryForm";
async function guardForm(data: FormData) {
  for (const [name, value] of data) {
    if (name.startsWith("$ACTION_")) continue;
    if (typeof value === "string" && value.length > (name === "message" ? 2000 : name === "name" ? 100 : name === "email" ? 254 : 500)) throw new RequestError("One of the fields is too long. Please shorten it.");
  }
  await assertRateLimit("enquiry:" + getRequestIdentifier({ headers: await headers() }), 5, 900_000);
}
function formError(error: unknown): FormState {
  if (error instanceof RequestError) return { error: error.message };
  console.error("Enquiry delivery failed");
  return { error: "We could not send your enquiry. Please try again, email info@dcjoinery.uk or call 07500 779126." };
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFromEmail(): string {
  return process.env.AI_DESIGNER_FROM_EMAIL || "website@dcjoineryni.uk";
}

function getAdminEmail(): string {
  return process.env.AI_DESIGNER_ADMIN_EMAIL || "info@dcjoinery.uk";
}

async function sendEmailChecked(
  resend: Resend,
  payload: Parameters<typeof resend.emails.send>[0]
): Promise<void> {
  const result = await resend.emails.send(payload);
  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message || "Unknown provider error"}`);
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s()+-]+$/;
  const digits = phone.replace(/\D/g, "").length;
  return phone.length <= 30 && digits >= 10 && digits <= 15 && phoneRegex.test(phone);
}

function validateHoneypot(value: string): void {
  if (value.trim()) {
    throw new RequestError("Spam detected");
  }
}

export async function sendContactForm(_state: FormState, formData: FormData): Promise<FormState> {
  try {
    const honeypot = String(formData.get("botField") || "").trim();
    validateHoneypot(honeypot);
    await guardForm(formData);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || name.length < 2) {
      throw new RequestError("Name must be at least 2 characters");
    }
    if (!validateEmail(email)) {
      throw new RequestError("Invalid email address");
    }
    if (!validatePhone(phone)) {
      throw new RequestError("Invalid phone number (minimum 10 digits)");
    }
    if (!message || message.length < 10) {
      throw new RequestError("Message must be at least 10 characters");
    }

    const resend = getResend();
    await sendEmailChecked(resend, {
      from: `DC Joinery <${getFromEmail()}>`,
      to: getAdminEmail(),
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

  } catch (error) {
    return formError(error);
  }
  redirect("/thank-you");
}

export async function sendKitchenFittingForm(_state: FormState, formData: FormData): Promise<FormState> {
  try {
    const honeypot = String(formData.get("botField") || "").trim();
    validateHoneypot(honeypot);
    await guardForm(formData);
    const name = String(formData.get("name") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const kitchenType = String(formData.get("kitchenType") || "");
    const wasteRemoval = String(formData.get("wasteRemoval") || "");
    const supplier = String(formData.get("supplier") || "");
    const worktop = String(formData.get("worktop") || "");
    const otherWorktop = String(formData.get("otherWorktop") || "");
    const installationDate = String(formData.get("installationDate") || "");
    const files = formData.getAll("documents") as File[];

    if (!name || name.length < 2) {
      throw new RequestError("Name must be at least 2 characters");
    }
    if (!validateEmail(email)) {
      throw new RequestError("Invalid email address");
    }
    if (!validatePhone(phone)) {
      throw new RequestError("Invalid phone number");
    }
    if (!address || address.length < 5) {
      throw new RequestError("Address required");
    }

    const attachments = await checkedAttachments(files);

    const resend = getResend();
    await sendEmailChecked(resend, {
      from: `DC Joinery <${getFromEmail()}>`,
      to: getAdminEmail(),
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
Appliances: ${String(formData.get("appliances") || "Not specified")}
Ready for installation: ${installationDate}

Attachments:
${attachments.length > 0 ? attachments.map((a) => a.filename).join(", ") : "No files uploaded"}
      `,
    });

  } catch (error) {
    return formError(error);
  }
  redirect("/thank-you");
}

export async function sendFitAndSupplyForm(_state: FormState, formData: FormData): Promise<FormState> {
  try {
    const honeypot = String(formData.get("botField") || "").trim();
    validateHoneypot(honeypot);
    await guardForm(formData);
    const name = String(formData.get("name") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const projectType = String(formData.get("projectType") || "");
    const hasDesign = String(formData.get("hasDesign") || "");
    const supplier = String(formData.get("supplier") || "");
    const message = String(formData.get("message") || "").trim();
    const files = formData.getAll("photos") as File[];

    if (!name || name.length < 2) {
      throw new RequestError("Name must be at least 2 characters");
    }
    if (!validateEmail(email)) {
      throw new RequestError("Invalid email address");
    }
    if (!validatePhone(phone)) {
      throw new RequestError("Invalid phone number");
    }
    if (!address || address.length < 5) {
      throw new RequestError("Address required");
    }

    const attachments = await checkedAttachments(files);

    const resend = getResend();
    await sendEmailChecked(resend, {
      from: `DC Joinery <${getFromEmail()}>`,
      to: getAdminEmail(),
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
Timeframe: ${String(formData.get("timeframe") || "Not specified")}
Trades: ${String(formData.get("trades") || "Not specified")}

Project description:
${message}

Attachments:
${attachments.length > 0 ? attachments.map((a) => a.filename).join(", ") : "No files uploaded"}
      `,
    });

  } catch (error) {
    return formError(error);
  }
  redirect("/thank-you");
}
