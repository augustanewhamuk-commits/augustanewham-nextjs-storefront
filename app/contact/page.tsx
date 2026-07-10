import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { Mail, ShoppingBag, Clock } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageSchema } from "@/lib/structured-data";
import { InstagramIcon, WhatsAppIcon } from "@/components/BrandIcons";
import { ContactForm } from "@/components/ContactForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ContactGlobe } from "@/components/ContactGlobe";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Augusta Newham — send us a message, or reach us by email, Instagram, Amazon and WhatsApp.",
  path: "/contact",
});

type Channel = {
  title: string;
  text: string;
  value: string;
  href?: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const channels: Channel[] = [
  {
    title: "Email Us",
    text: "Questions about an order, sizing or anything else — we usually reply within a business day.",
    value: site.email,
    href: `mailto:${site.email}`,
    Icon: Mail,
  },
  {
    title: "Message Us",
    text: "Reach us quickly on WhatsApp for order help and quick questions.",
    value: "Chat on WhatsApp",
    href: `https://wa.me/?text=${encodeURIComponent(`Augusta Newham — ${site.url}`)}`,
    Icon: WhatsAppIcon,
  },
  {
    title: "Follow Us",
    text: "See new drops and styling, and shop via the link in our bio.",
    value: "@augustanewham",
    href: site.social.instagram,
    Icon: InstagramIcon,
  },
  {
    title: "Shop on Amazon",
    text: "Browse and buy selected pieces on our Amazon storefront.",
    value: "Amazon.co.uk: Augusta Newham",
    href: "https://www.amazon.co.uk/s?k=Augusta+Newham",
    Icon: ShoppingBag,
  },
];

const hours = [
  { day: "Monday – Friday", time: "9am – 8pm" },
  { day: "Saturday", time: "10am – 6pm" },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact Us", path: "/contact" },
          ]),
          pageSchema({
            type: "ContactPage",
            name: "Contact Us",
            path: "/contact",
            description:
              "Send us a message, or reach us by email, Instagram, Amazon and WhatsApp.",
          }),
        ]}
      />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-[1200px] px-6 py-16 lg:px-10 lg:py-20">
          <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
            Support
          </p>
          <h1 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.12em] text-brand-black sm:text-5xl">
            Get in Touch
          </h1>

          <div className="mt-12 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
            {/* Form */}
            <div>
              <h2 className="font-wordmark text-base uppercase tracking-[0.12em] text-brand-black">
                Send a Message
              </h2>
              <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-brand-gray">
                Fill in the form below and we&apos;ll get back to you as soon as
                we can.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            {/* Channels + hours */}
            <div className="lg:border-l lg:border-brand-light-gray lg:pl-12">
              <ul className="space-y-8">
                {channels.map(({ title, text, value, href, Icon }) => {
                  const external = href?.startsWith("http");
                  return (
                    <li key={title}>
                      <h3 className="font-wordmark text-[13px] uppercase tracking-[0.12em] text-brand-black">
                        {title}
                      </h3>
                      <p className="mt-1.5 font-body text-[13px] leading-relaxed text-brand-gray">
                        {text}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-brand-black" />
                        {href ? (
                          <a
                            href={href}
                            target={external ? "_blank" : undefined}
                            rel={external ? "noopener noreferrer" : undefined}
                            className="font-body text-[14px] text-brand-black underline decoration-1 underline-offset-2 transition-colors hover:text-brand-gray"
                          >
                            {value}
                          </a>
                        ) : (
                          <span className="font-body text-[14px] text-brand-black">
                            {value}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}

                <li>
                  <h3 className="font-wordmark text-[13px] uppercase tracking-[0.12em] text-brand-black">
                    Customer Service Hours
                  </h3>
                  <div className="mt-2.5 flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-black" />
                    <dl className="space-y-1">
                      {hours.map(({ day, time }) => (
                        <div key={day} className="flex gap-2 font-body text-[14px]">
                          <dt className="text-brand-gray">{day}:</dt>
                          <dd className="text-brand-black">{time}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Online store — interactive 3D globe with our shipping reach */}
        <section className="relative flex min-h-[460px] items-center justify-center overflow-hidden bg-brand-black text-brand-white sm:min-h-[640px] lg:min-h-[820px]">
          {/* 3D globe map (deck.gl arcs over a MapLibre globe) */}
          <div className="absolute inset-0">
            <ContactGlobe />
          </div>

          {/* Darken the top so the headline stays legible over the globe */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-brand-black via-brand-black/70 to-transparent"
            aria-hidden="true"
          />

          <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1200px] px-6 pt-16 text-center lg:px-10">
            <h2 className="mx-auto max-w-2xl font-wordmark text-3xl font-light uppercase leading-tight tracking-[0.1em] sm:text-4xl">
              Find Us Wherever You Are
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-body text-sm leading-relaxed text-brand-white/80">
              Augusta Newham is a fully online boutique — there&apos;s no shop
              floor to visit, just your doorstep to ship to. We&apos;re open day
              or night, delivering nationally and internationally.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-[1200px] border-t border-brand-light-gray px-6 py-20 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
                FAQ
              </p>
              <h2 className="mt-2 font-wordmark text-3xl font-light uppercase leading-tight tracking-[0.1em] text-brand-black sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <FaqAccordion />
          </div>
        </section>
      </main>
    </>
  );
}
