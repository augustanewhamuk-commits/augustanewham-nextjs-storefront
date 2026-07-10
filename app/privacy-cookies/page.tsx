import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageSchema } from "@/lib/structured-data";
import { LegalLayout } from "@/components/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How Augusta Newham collects, uses and protects your personal data, including consent, marketing, user-generated content and data retention.",
  path: "/privacy-cookies",
});

export default function PrivacyCookiesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Privacy Policy", path: "/privacy-cookies" },
          ]),
          pageSchema({
            name: "Privacy Policy",
            path: "/privacy-cookies",
            description:
              "How we collect, use and protect your personal data.",
          }),
        ]}
      />

      <LegalLayout eyebrow="Legal" title="Privacy Policy">
        <p>
          {site.name} is completely committed to protecting the privacy of our
          site visitors and customers. Therefore, we will not disclose
          information about our customers to third parties except where it is
          part of providing a service to you.
        </p>

        <h2>Consent</h2>
        <p>
          Your consent is important to us too and we will never sell your name,
          address, e-mail address, payment information or any other personal
          information to any third party without your consent.
        </p>

        <h2>Communication &amp; Marketing</h2>
        <p>
          If you have made a purchase from us, we may occasionally update you on
          our latest products, news and special offers via e-mail if you opt-in
          to receive email marketing communications from us. You can opt-out at
          any time.
        </p>

        <h2>User-Generated Content Policy</h2>
        <p>
          By tagging {site.name} on social media platforms such as TikTok,
          Instagram, Facebook, X (formerly Twitter), or any other public online
          platform, you grant {site.name} the right to use your tagged content
          (including your image, video, username, and any accompanying text or
          captions) for organic marketing purposes.
        </p>
        <p>This includes use across our owned communication channels such as:</p>
        <ul>
          <li>Our official social media accounts</li>
          <li>Our email newsletters</li>
          <li>Our website</li>
        </ul>
        <p>
          This permission is granted royalty-free, worldwide, and in perpetuity
          for non-commercial, organic promotional use.
        </p>

        <h2>Children&apos;s Data</h2>
        <p>
          The Services are not intended to be used by children, and we do not
          knowingly collect any personal information about children. If you are
          the parent or guardian of a child who has provided us with their
          personal information, you may contact us using the contact details set
          out below to request that it be deleted.
        </p>

        <h2>Security</h2>
        <p>
          Any information you send to us may not be secure while in transit. We
          advise that you do not use insecure channels to communicate sensitive
          or confidential information to us.
        </p>
        <p>
          How long we retain your personal information depends on different
          factors, such as whether we need the information to maintain your
          account, to provide the Services, comply with legal obligations,
          resolve disputes or enforce our legal agreements and policies.
        </p>

        <h2>Website Statistics</h2>
        <p>
          We may record statistics about the number of visitors to this Website
          or number of purchases made for improvement purposes. This is to help
          it improve the services to our customers and ultimately provide the
          most appropriate products.
        </p>

        <h2>Third Party Websites</h2>
        <p>
          Our site may contain links to and from other websites. If you follow a
          link to any of these websites, please note that they have their own
          privacy policies and we do not accept any liability for these policies.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or wish to exercise
          any of your rights, you can contact us at{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </LegalLayout>
    </>
  );
}
