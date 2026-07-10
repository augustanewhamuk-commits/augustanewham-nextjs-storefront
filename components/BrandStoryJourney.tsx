"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll } from "framer-motion";

type Chapter = {
  n: string;
  title: string;
  body: string;
  image: string;
};

const chapters: Chapter[] = [
  {
    n: "01",
    title: "A Perfect Base",
    body: "Augusta Newham was created because we believed there's a need to have a perfect base before you put on your outfit for the day, no matter what you wear - the aim is to make every woman comfortable, at ease with themselves.",
    image: "/media/images/homepage/BA4A963666666 (1).png",
  },
  {
    n: "02",
    title: "Comfort & Confidence",
    body: "Our products are designed for absolute comfort and to enhance confidence in a woman’s everyday life.",
    image: "/media/images/homepage/WhatsApp Image 2026-06-11 at 20.15.19.png",
  },
  {
    n: "03",
    title: "Where It Began",
    body: "This started as a simple idea from wearing numerous shapewear over the years to keep me in form and noticing all the gaps in them and developing something more realistic to fit every woman’s bodyform.",
    image: "/media/images/homepage/WhatsApp Image 2026-06-01 at 15.24.11.png",
  },
  {
    n: "04",
    title: "Made for Every Woman",
    body: "This process also gave an understanding of women’s body needs in every stage of their life and the requirement to provide a product that would spew assurance",
    image: "/media/images/homepage/BA4A9630.png",
  },
  {
    n: "05",
    title: "Closest to the Skin",
    body: "At Augusta Newham, the base is what you wear nearest to your skin, ranging from shapewear, lingerie, nightwear, under slips, briefs, maternity clothing , loungewear to basic outfits  - and as we design we put your age, size, feelings and product authenticity into perspective.",
    image: "/media/images/homepage/WhatsApp Image 2026-05-13 at 22.17.36.png",
  },
  {
    n: "06",
    title: "Everyday Staples",
    body: "Our products are clothing staples designed and developed for daily wear covering every stage of a woman’s life.",
    image: "/media/images/homepage/WhatsApp Image 2026-05-13 at 22.18.28.png",
  },
];

// Orchestrates the text block: children appear one after another.
const textGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
// Each line slides in from the side as it appears.
const slideIn = {
  hidden: { opacity: 0, x: -28 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};
// The image pops out with a little spring.
const popIn = {
  hidden: { opacity: 0, scale: 0.82 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 130, damping: 13 },
  },
};

export function BrandStoryJourney() {
  const ref = useRef<HTMLDivElement>(null);
  // The spine fills from top to bottom as the timeline passes the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 70%"],
  });

  return (
    <div ref={ref} className="relative mx-auto max-w-[1100px]">
      {/* Spine: faint track (left on mobile, centre on desktop) + a black
          fill bound to scroll progress. */}
      <div
        className="absolute left-5 top-0 h-full w-px -translate-x-1/2 bg-brand-light-gray sm:left-1/2"
        aria-hidden="true"
      >
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute inset-0 origin-top bg-brand-black"
        />
      </div>

      <div className="space-y-16 sm:space-y-28">
        {chapters.map((c) => (
          <div
            key={c.n}
            className="relative pl-14 sm:grid sm:grid-cols-2 sm:items-center sm:gap-16 sm:pl-0"
          >
            {/* Milestone dot on the spine */}
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-90px" }}
              transition={{ duration: 0.4, ease: "backOut" }}
              className="absolute left-5 top-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-brand-black bg-brand-off-white sm:left-1/2 sm:top-1/2 sm:-translate-y-1/2"
              aria-hidden="true"
            />

            {/* Text — left side; lines stagger in */}
            <motion.div
              variants={textGroup}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-90px" }}
              className="sm:pr-12 sm:text-right"
            >
              <motion.span
                variants={slideIn}
                className="block font-wordmark text-[44px] font-light leading-none text-brand-gray/35 sm:text-[60px]"
              >
                {c.n}
              </motion.span>
              <motion.h3
                variants={slideIn}
                className="mt-2 font-wordmark text-xl uppercase tracking-[0.1em] text-brand-black sm:text-2xl"
              >
                {c.title}
              </motion.h3>
              <motion.p
                variants={slideIn}
                className="mt-3 font-body text-[15px] leading-relaxed text-brand-gray"
              >
                {c.body}
              </motion.p>
            </motion.div>

            {/* Image — right side; pops out */}
            <motion.div
              variants={popIn}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-90px" }}
              className="mt-6 sm:col-start-2 sm:mt-0 sm:pl-12"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
