import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageSchema } from "@/lib/structured-data";
import { LegalLayout } from "@/components/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Returns, Refund and Shipping Policy",
  description:
    "Augusta Newham returns, refund and shipping policy — how returns, refunds and return shipping work.",
  path: "/returns-refund-shipping",
});

export default function ReturnsRefundShippingPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            {
              name: "Returns, Refund and Shipping Policy",
              path: "/returns-refund-shipping",
            },
          ]),
          pageSchema({
            name: "Returns, Refund and Shipping Policy",
            path: "/returns-refund-shipping",
            description: "How returns, refunds and return shipping work.",
          }),
        ]}
      />

      <LegalLayout eyebrow="Legal" title="Returns, Refund & Shipping">
        <h2>Returns</h2>
        <p>
          You can make a return within 30 days of placing your order for a
          refund. All orders except pants and briefs can be returned irrespective of method of purchase.
        </p>
        <p>
          Please email us at{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a> with your order
          number and the reason for return. We will respond to you within 2
          business days with the return shipping address.
        </p>
        <p>
          Items can only be returned if in original condition, unworn, unwashed,
          with tags still attached.
        </p>
        {/* <p>It&apos;s one return per sale, no combined return.</p> */}

        <h2>Refunds</h2>
        <p>
          Once your return is received and inspected, we will send you an email to
          notify you that we have received your returned item. We will also notify
          you of the approval or rejection of your refund.
        </p>
        <p>
          If you are approved, then your refund will be processed, and a credit
          will automatically be applied to your credit card or original method of
          payment, within a certain amount of days.
        </p>

        <h2>Shipping</h2>
        <p>
          To return your product, you should mail your product to our return
          shipping address.
        </p>
        <p>All returns are subject to shipping fee deducted from your refund.</p>
        <p>
          Depending on your location, the time it may take for your exchanged
          product to reach you, may vary.
        </p>
      </LegalLayout>
    </>
  );
}
