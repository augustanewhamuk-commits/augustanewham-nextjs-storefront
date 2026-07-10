/**
 * "Fly to cart" animation. Clones the product image at the origin element
 * (the Add to Cart button) and animates it in an arc to the visible cart icon
 * in the header, then bumps the cart. Uses the Web Animations API — no deps.
 *
 * The header renders more than one cart button (mobile vs desktop bars), so we
 * pick whichever `[data-cart-fly-target]` is actually on screen. Respects
 * prefers-reduced-motion. `onLand` always fires (immediately if we can't
 * animate) so callers can reliably open the cart afterwards.
 */
type FlyOptions = { onLand?: () => void };

export function flyToCart(
  imageSrc: string,
  originEl: HTMLElement | null,
  { onLand }: FlyOptions = {},
) {
  const finish = () => onLand?.();

  if (
    typeof window === "undefined" ||
    !originEl ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    finish();
    return;
  }

  const target =
    Array.from(
      document.querySelectorAll<HTMLElement>("[data-cart-fly-target]"),
    ).find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    }) ?? null;

  if (!target) {
    finish();
    return;
  }

  const start = originEl.getBoundingClientRect();
  const end = target.getBoundingClientRect();

  const width = 72;
  const height = 90;
  const startX = start.left + start.width / 2 - width / 2;
  const startY = start.top + start.height / 2 - height / 2;
  const endX = end.left + end.width / 2 - width / 2;
  const endY = end.top + end.height / 2 - height / 2;

  const clone = document.createElement("img");
  clone.src = imageSrc;
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${width}px`,
    height: `${height}px`,
    objectFit: "cover",
    borderRadius: "2px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
    zIndex: "200",
    pointerEvents: "none",
    willChange: "transform, opacity",
  });
  document.body.appendChild(clone);

  const animation = clone.animate(
    [
      { transform: `translate(${startX}px, ${startY}px) scale(1)`, opacity: 1 },
      {
        // lift above both points for an arc
        transform: `translate(${(startX + endX) / 2}px, ${Math.min(startY, endY) - 80}px) scale(0.8)`,
        opacity: 1,
        offset: 0.6,
      },
      { transform: `translate(${endX}px, ${endY}px) scale(0.15)`, opacity: 0.3 },
    ],
    { duration: 800, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
  );

  animation.onfinish = () => {
    clone.remove();
    target.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.3)" },
        { transform: "scale(1)" },
      ],
      { duration: 320, easing: "ease-out" },
    );
    finish();
  };
}
