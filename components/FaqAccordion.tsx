import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { site } from "@/lib/site";

type Faq = {
  q: string;
  /** Rendered answer (may contain links). */
  node: ReactNode;
  /** Plain-text answer for FAQ rich results. Omit to keep a Q&A out of schema. */
  schemaText?: string;
};

const STORE_ANSWER =
  "We are an online store and we ship nationally and internationally.";
const ORDER_ANSWER =
  "You can make an order via our WhatsApp link in our Instagram bio, via our website, Amazon and Instagram shop.";
const PROCESSED_ANSWER =
  "Once you place your order you will get a confirmation message or email within five minutes of your order being placed. This will give you updates and progress on the next steps for your order.";
const CANCEL_ANSWER =
  "You are able to cancel orders that haven't left our warehouse or been dispatched, so it's advisable to cancel orders as soon as possible. If not, it will take longer for returns to be processed, as delivery to your address will have to happen for you to process the return.";
const SHIPPING_TIME_ANSWER =
  "For locations in Nigeria and Europe it will take 3–5 working days. All other countries will take between 6–8 working days.";
const CARE_ANSWER =
  "With each delivery of the product you purchase, we include an after-care garment card which gives instructions on how to care for your products.";
const SIZING_SCHEMA_TEXT =
  "We have a size chart on our website and WhatsApp catalogue where you can assess sizing for all our products.";

export const faqs: Faq[] = [
  { q: "Where is your store based?", node: STORE_ANSWER, schemaText: STORE_ANSWER },
  {
    q: "How do I determine sizing?",
    node: (
      <>
        We have a{" "}
        <a href="/size-guide">size chart on our website</a> and WhatsApp
        catalogue where you can assess sizing for all our products.
      </>
    ),
    schemaText: SIZING_SCHEMA_TEXT,
  },
  { q: "How do I order products?", node: ORDER_ANSWER, schemaText: ORDER_ANSWER },
  {
    q: "How do I know my order is being processed?",
    node: PROCESSED_ANSWER,
    schemaText: PROCESSED_ANSWER,
  },
  // {
  //   q: "Can I cancel or change an existing order?",
  //   node: CANCEL_ANSWER,
  //   schemaText: CANCEL_ANSWER,
  // },
  // {
  //   q: "How do I process returns?",
  //   node: (
  //     <>
  //       For returns please send an email to{" "}
  //       <a href={`mailto:${site.email}`}>{site.email}</a> and label the subject
  //       of the email as &ldquo;Returns&rdquo;. Please note you will be
  //       responsible for the shipping fee. Once items have been shipped in perfect
  //       condition, we will send you an email to confirm receipt and process your
  //       refund ASAP!
  //     </>
  //   ),
  //   schemaText: `For returns please send an email to ${site.email} and label the subject of the email as "Returns". Please note you will be responsible for the shipping fee. Once items have been shipped in perfect condition, we will send you an email to confirm receipt and process your refund ASAP!`,
  // },
  {
    q: "How long does shipping take to my location?",
    node: SHIPPING_TIME_ANSWER,
    schemaText: SHIPPING_TIME_ANSWER,
  },
  {
    q: "How do I wash and care for the products?",
    node: CARE_ANSWER,
    schemaText: CARE_ANSWER,
  },
];

// FAQ rich-result schema — only Q&As with a real (visible) answer are eligible.
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs
    .filter((f) => f.schemaText)
    .map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.schemaText },
    })),
};

export function FaqAccordion() {
  return (
    <div className="border-t border-brand-light-gray">
      {faqs.map((f) => (
        <details key={f.q} className="group border-b border-brand-light-gray">
          <summary className="flex list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
            <span className="font-wordmark text-[14px] uppercase tracking-[0.08em] text-brand-black">
              {f.q}
            </span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-brand-gray transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="-mt-1 pb-5 font-body text-[14px] leading-relaxed text-brand-gray">
            {f.node}
          </div>
        </details>
      ))}
    </div>
  );
}
