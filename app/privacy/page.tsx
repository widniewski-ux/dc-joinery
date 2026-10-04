import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
export const metadata = pageMetadata("Privacy and Cookies", "How DC Joinery handles enquiries, kitchen photographs, website cookies and privacy requests.", "/privacy");
export default function PrivacyPage() {
  return <main className="mx-auto max-w-3xl space-y-7 px-6 py-16 text-neutral-200">
    <h1 className="text-4xl font-bold text-white">Privacy and cookies</h1>
    <p>DC Joinery, Northern Ireland, uses information you provide to respond to enquiries, prepare kitchen concepts and discuss quotations. Contact <a className="underline" href="mailto:info@dcjoinery.uk">info@dcjoinery.uk</a> about your information.</p>
    <h2 className="text-2xl font-semibold">Enquiries and kitchen photographs</h2>
    <p>Forms collect the contact details, project information and attachments you choose to send. The AI designer also processes your kitchen photograph and selected finishes. Upload only images you have permission to use, and avoid including people, documents or personal items you do not want processed.</p>
    <p>We use these details to take steps you request before a potential contract and to answer your enquiry. We use security logs and request limits to protect the service. We do not use the enquiry forms to enrol you in a marketing list.</p>
    <h2 className="text-2xl font-semibold">Services involved</h2>
    <p>The website uses Vercel for hosting, Supabase for project records and files, Resend for enquiry emails, OpenAI for AI analysis and generation, Replicate as an alternative image provider, and PDFShift for reports. The relevant project content is sent to these services when you use the corresponding feature. Providers may process information outside the UK; their applicable privacy terms and transfer arrangements also apply.</p>
    <p>AI concepts are illustrative and require a site survey and professional review. They are not technical plans or binding quotations.</p>
    <h2 className="text-2xl font-semibold">Storage and access</h2>
    <p>Project access in your browser lasts up to seven days. Access links for project images and reports expire after one hour; treat these links as private. These access periods do not automatically delete the underlying enquiry, project or email records. Contact us to discuss retention or request deletion of your information.</p>
    <h2 className="text-2xl font-semibold">Cookies and choices</h2>
    <p>Essential cookies secure your design session and administrator login. Browser storage remembers your cookie choice. Google Analytics is loaded only if you accept it and is used to understand visits. You can withdraw that choice using “Cookie preferences” at the bottom of any page. External links such as WhatsApp, Facebook and Instagram open services with their own privacy practices.</p>
    <h2 className="text-2xl font-semibold">Your information</h2>
    <p>You can contact us to request access, correction or deletion, or to raise an objection to how your information is used. If a concern remains unresolved, you can contact the <a className="underline" href="https://ico.org.uk/">Information Commissioner’s Office</a>.</p>
    <Link className="inline-block text-amber-300 underline" href="/contact">Contact DC Joinery</Link>
  </main>;
}
