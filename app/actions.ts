"use server";

import { Resend } from "resend";
import { redirect } from "next/navigation";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ATTACHMENT_COUNT = 5;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".doc",
  ".docx",
];

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
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function validateHoneypot(value: string): void {
  if (value.trim()) {
    throw new Error("Spam detected");
  }
}

async function prepareAttachments(files: File[]) {
  const validFiles = files.filter((file) => file.size > 0);

  if (validFiles.length > MAX_ATTACHMENT_COUNT) {
    throw new Error(`Please upload no more than ${MAX_ATTACHMENT_COUNT} files`);
  }

  for (const file of validFiles) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} exceeds 5MB limit`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const extension = file.name.toLowerCase().split('.').pop() || "";
      if (!ALLOWED_FILE_EXTENSIONS.includes(`.${extension}`)) {
        throw new Error(`File type not allowed: ${file.type}`);
      }
    }
  }

  return Promise.all(
    validFiles.map(async (file) => ({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()),
    }))
  );
}

export async function sendContactForm(formData: FormData) {
  try {
    const honeypot = String(formData.get("botField") || "").trim();
    validateHoneypot(honeypot);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || name.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }
    if (!validateEmail(email)) {
      throw new Error("Invalid email address");
    }
    if (!validatePhone(phone)) {
      throw new Error("Invalid phone number (minimum 10 digits)");
    }
    if (!message || message.length < 10) {
      throw new Error("Message must be at least 10 characters");
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

    redirect("/thank-you");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    throw new Error(message);
  }
}

export async function sendKitchenFittingForm(formData: FormData) {
  try {
    const honeypot = String(formData.get("botField") || "").trim();
    validateHoneypot(honeypot);
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
      throw new Error("Name must be at least 2 characters");
    }
    if (!validateEmail(email)) {
      throw new Error("Invalid email address");
    }
    if (!validatePhone(phone)) {
      throw new Error("Invalid phone number");
    }
    if (!address || address.length < 5) {
      throw new Error("Address required");
    }

    const attachments = await prepareAttachments(files);

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
Ready for installation: ${installationDate}

Attachments:
${attachments.length > 0 ? attachments.map((a) => a.filename).join(", ") : "No files uploaded"}
      `,
    });

    redirect("/thank-you");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send form";
    throw new Error(message);
  }
}

export async function sendFitAndSupplyForm(formData: FormData) {
  try {
    const honeypot = String(formData.get("botField") || "").trim();
    validateHoneypot(honeypot);
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
      throw new Error("Name must be at least 2 characters");
    }
    if (!validateEmail(email)) {
      throw new Error("Invalid email address");
    }
    if (!validatePhone(phone)) {
      throw new Error("Invalid phone number");
    }
    if (!address || address.length < 5) {
      throw new Error("Address required");
    }

    const attachments = await prepareAttachments(files);

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

Project description:
${message}

Attachments:
${attachments.length > 0 ? attachments.map((a) => a.filename).join(", ") : "No files uploaded"}
      `,
    });

    redirect("/thank-you");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send form";
    throw new Error(message);
  }
}
