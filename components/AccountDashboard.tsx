"use client";

import { useEffect, useState, useTransition } from "react";
import { MapPin, Package, Pencil, Plus, Trash2, User } from "lucide-react";
import {
  type CustomerAddress,
  type CustomerOrder,
  type Customer,
  type Money,
} from "@/lib/customer";
import {
  createAddressAction,
  deleteAddressAction,
  saveProfileAction,
  setDefaultAddressAction,
  updateAddressAction,
} from "@/lib/account-actions";

const fieldLabel =
  "block font-body text-[11px] uppercase tracking-[0.18em] text-brand-gray";
const fieldInput =
  "mt-2 w-full appearance-none rounded-none border border-brand-light-gray bg-brand-white px-4 py-2.5 font-body text-[15px] text-brand-black outline-none transition-colors focus:border-brand-black";
const errorText = "mt-3 font-body text-[12px] text-red-700";

/* --- View-model helpers (map Storefront Customer shapes to the UI) --- */

type AddressDraft = {
  /** null = creating a new address. */
  id: string | null;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

const emptyAddress = (): AddressDraft => ({
  id: null,
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  province: "",
  zip: "",
  country: "United Kingdom",
  isDefault: false,
});

const toDraft = (a: CustomerAddress, isDefault: boolean): AddressDraft => ({
  id: a.id,
  firstName: a.firstName ?? "",
  lastName: a.lastName ?? "",
  company: a.company ?? "",
  address1: a.address1 ?? "",
  address2: a.address2 ?? "",
  city: a.city ?? "",
  province: a.province ?? "",
  zip: a.zip ?? "",
  country: a.country ?? "",
  isDefault,
});

/** Build a MailingAddressInput, omitting empty optional fields. */
const toInput = (d: AddressDraft) => {
  const input: Record<string, string> = {};
  const fields: (keyof AddressDraft)[] = [
    "firstName",
    "lastName",
    "company",
    "address1",
    "address2",
    "city",
    "province",
    "zip",
    "country",
  ];
  for (const key of fields) {
    const value = d[key];
    if (typeof value === "string" && value.trim()) input[key] = value.trim();
  }
  return input;
};

const addressHeading = (a: CustomerAddress): string =>
  [a.firstName, a.lastName].filter(Boolean).join(" ").trim() ||
  a.company ||
  a.address1 ||
  "Address";

const formatMoney = (m: Money): string => {
  const amount = Number(m.amount);
  try {
    // Pinned to the site locale — SSR + client must format identically or
    // React reports a hydration mismatch (see formatPrice in lib/currency.ts).
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: m.currencyCode,
    }).format(amount);
  } catch {
    return `${m.currencyCode} ${amount.toFixed(2)}`;
  }
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatStatus = (
  order: CustomerOrder,
): { label: string; solid: boolean } => {
  const raw = order.fulfillmentStatus ?? order.financialStatus ?? "UNFULFILLED";
  const label = raw
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const solid = raw === "FULFILLED" || raw === "PAID";
  return { label, solid };
};

const sectionLinks = [
  { id: "details", label: "Profile", Icon: User },
  { id: "addresses", label: "Addresses", Icon: MapPin },
  { id: "orders", label: "Orders", Icon: Package },
];

export function AccountDashboard({
  customer,
  orders,
}: {
  customer: Customer;
  orders: CustomerOrder[];
}) {
  const defaultAddressId = customer.defaultAddress?.id ?? null;
  const [isPending, startTransition] = useTransition();

  /* --- Scroll-spy: highlight the section currently in view --- */
  const [activeSection, setActiveSection] = useState(sectionLinks[0].id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      // Trigger when a section sits in the upper third of the viewport.
      { rootMargin: "-25% 0px -65% 0px" },
    );
    sectionLinks.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /* --- Profile editing --- */
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState({
    firstName: customer.firstName ?? "",
    lastName: customer.lastName ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
  });
  const [profileError, setProfileError] = useState<string | null>(null);

  const startEditProfile = () => {
    setDraftProfile({
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
    });
    setProfileError(null);
    setEditingProfile(true);
  };
  const submitProfile = (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError(null);
    startTransition(async () => {
      const errors = await saveProfileAction(draftProfile);
      if (errors.length === 0) setEditingProfile(false);
      else setProfileError(errors[0].message);
    });
  };

  /* --- Address editing --- */
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [draftAddress, setDraftAddress] = useState<AddressDraft>(emptyAddress());
  const [addressError, setAddressError] = useState<string | null>(null);

  const startAddAddress = () => {
    setDraftAddress(emptyAddress());
    setAddressError(null);
    setEditingAddressId("new");
  };
  const startEditAddress = (address: CustomerAddress) => {
    setDraftAddress(toDraft(address, address.id === defaultAddressId));
    setAddressError(null);
    setEditingAddressId(address.id);
  };
  const submitAddress = (event: React.FormEvent) => {
    event.preventDefault();
    setAddressError(null);
    startTransition(async () => {
      const input = toInput(draftAddress);
      const errors = draftAddress.id
        ? await updateAddressAction(
            draftAddress.id,
            input,
            draftAddress.isDefault,
          )
        : await createAddressAction(input, draftAddress.isDefault);
      if (errors.length === 0) setEditingAddressId(null);
      else setAddressError(errors[0].message);
    });
  };
  const deleteAddress = (id: string) => {
    startTransition(async () => {
      await deleteAddressAction(id);
    });
  };
  const setDefaultAddress = (id: string) => {
    startTransition(async () => {
      await setDefaultAddressAction(id);
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
      {/* Section nav */}
      <nav
        aria-label="Account sections"
        className="flex gap-1 overflow-x-auto lg:sticky lg:top-28 lg:flex-col lg:gap-0 lg:self-start"
      >
        {sectionLinks.map(({ id, label, Icon }) => {
          const active = activeSection === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active ? "true" : undefined}
              className={`inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap px-3 py-2.5 font-wordmark text-[13px] uppercase tracking-[0.08em] transition-colors lg:border-l-2 lg:px-4 ${
                active
                  ? "bg-brand-off-white text-brand-black lg:bg-transparent lg:border-brand-black"
                  : "text-brand-gray hover:text-brand-black lg:border-transparent lg:hover:border-brand-light-gray"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </a>
          );
        })}
      </nav>

      <div className="min-w-0 space-y-16">
        {/* Profile details */}
        <section id="details" className="scroll-mt-28">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-wordmark text-base uppercase tracking-[0.12em] text-brand-black">
              Profile Details
            </h2>
            {!editingProfile ? (
              <button
                type="button"
                onClick={startEditProfile}
                className="inline-flex items-center gap-1.5 font-body text-[12px] uppercase tracking-[0.08em] text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </button>
            ) : null}
          </div>

          {editingProfile ? (
            <form
              onSubmit={submitProfile}
              className="border border-brand-light-gray p-6 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={fieldLabel}>
                    First Name
                  </label>
                  <input
                    id="firstName"
                    className={fieldInput}
                    value={draftProfile.firstName}
                    onChange={(e) =>
                      setDraftProfile({
                        ...draftProfile,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={fieldLabel}>
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    className={fieldInput}
                    value={draftProfile.lastName}
                    onChange={(e) =>
                      setDraftProfile({
                        ...draftProfile,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className={fieldLabel}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={fieldInput}
                    value={draftProfile.email}
                    onChange={(e) =>
                      setDraftProfile({ ...draftProfile, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={fieldLabel}>
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={fieldInput}
                    value={draftProfile.phone}
                    onChange={(e) =>
                      setDraftProfile({ ...draftProfile, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              {profileError ? <p className={errorText}>{profileError}</p> : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center bg-brand-black px-7 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray disabled:opacity-50"
                >
                  {isPending ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="inline-flex items-center justify-center border border-brand-black px-7 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid gap-x-8 gap-y-6 border border-brand-light-gray p-6 sm:grid-cols-2 sm:p-8">
              <Detail label="Name">
                {[customer.firstName, customer.lastName]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </Detail>
              <Detail label="Email Address">{customer.email ?? "—"}</Detail>
              <Detail label="Phone Number">{customer.phone || "—"}</Detail>
            </dl>
          )}
        </section>

        {/* Addresses */}
        <section id="addresses" className="scroll-mt-28">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-wordmark text-base uppercase tracking-[0.12em] text-brand-black">
              Saved Addresses
            </h2>
            {editingAddressId === null ? (
              <button
                type="button"
                onClick={startAddAddress}
                className="inline-flex items-center gap-1.5 font-body text-[12px] uppercase tracking-[0.08em] text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add new
              </button>
            ) : null}
          </div>

          {editingAddressId !== null ? (
            <AddressForm
              draft={draftAddress}
              setDraft={setDraftAddress}
              onSubmit={submitAddress}
              onCancel={() => setEditingAddressId(null)}
              isNew={editingAddressId === "new"}
              isPending={isPending}
              error={addressError}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {customer.addresses.map((address) => {
                const isDefault = address.id === defaultAddressId;
                return (
                  <div
                    key={address.id}
                    className="flex flex-col border border-brand-light-gray p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-wordmark text-[13px] uppercase tracking-[0.1em] text-brand-black">
                        {addressHeading(address)}
                      </span>
                      {isDefault ? (
                        <span className="bg-brand-black px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.1em] text-brand-white">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <address className="mt-3 font-body text-[13px] not-italic leading-relaxed text-brand-gray">
                      {address.address1}
                      {address.address2 ? (
                        <>
                          <br />
                          {address.address2}
                        </>
                      ) : null}
                      <br />
                      {[address.city, address.province, address.zip]
                        .filter(Boolean)
                        .join(" ")}
                      <br />
                      {address.country}
                    </address>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 font-body text-[12px] uppercase tracking-[0.08em]">
                      <button
                        type="button"
                        onClick={() => startEditAddress(address)}
                        className="text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
                      >
                        Edit
                      </button>
                      {!isDefault ? (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(address.id)}
                          disabled={isPending}
                          className="text-brand-gray underline decoration-1 underline-offset-4 transition-colors hover:text-brand-black disabled:opacity-50"
                        >
                          Set default
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => deleteAddress(address.id)}
                        disabled={isPending}
                        className="ml-auto inline-flex items-center gap-1 text-brand-gray transition-colors hover:text-brand-black disabled:opacity-50"
                        aria-label={`Delete ${addressHeading(address)} address`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {customer.addresses.length === 0 ? (
                <p className="font-body text-sm text-brand-gray">
                  No saved addresses yet.
                </p>
              ) : null}
            </div>
          )}
        </section>

        {/* Order history */}
        <section id="orders" className="scroll-mt-28">
          <h2 className="mb-5 font-wordmark text-base uppercase tracking-[0.12em] text-brand-black">
            Order History
          </h2>
          {orders.length === 0 ? (
            <p className="font-body text-sm text-brand-gray">
              You haven&apos;t placed any orders yet.
            </p>
          ) : (
            <ul className="divide-y divide-brand-light-gray border-y border-brand-light-gray">
              {orders.map((order) => {
                const status = formatStatus(order);
                return (
                  <li
                    key={order.id}
                    className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-wordmark text-[14px] uppercase tracking-[0.08em] text-brand-black">
                          {order.name}
                        </span>
                        <StatusBadge {...status} />
                      </div>
                      <p className="mt-1.5 font-body text-[13px] text-brand-gray">
                        {formatDate(order.processedAt)} ·{" "}
                        {order.lineItems
                          .map((item) => `${item.quantity}× ${item.title}`)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-5 sm:flex-col sm:items-end sm:gap-1">
                      <span className="font-body text-[14px] text-brand-black tabular-nums">
                        {formatMoney(order.totalPrice)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-body text-[11px] uppercase tracking-[0.18em] text-brand-gray">
        {label}
      </dt>
      <dd className="mt-1.5 font-body text-[15px] text-brand-black">
        {children}
      </dd>
    </div>
  );
}

function StatusBadge({ label, solid }: { label: string; solid: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.1em] ${
        solid
          ? "bg-brand-black text-brand-white"
          : "border border-brand-black text-brand-black"
      }`}
    >
      {label}
    </span>
  );
}

function AddressForm({
  draft,
  setDraft,
  onSubmit,
  onCancel,
  isNew,
  isPending,
  error,
}: {
  draft: AddressDraft;
  setDraft: (address: AddressDraft) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  isNew: boolean;
  isPending: boolean;
  error: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="border border-brand-light-gray p-6 sm:p-8">
      <p className="mb-5 font-wordmark text-[13px] uppercase tracking-[0.1em] text-brand-black">
        {isNew ? "Add Address" : "Edit Address"}
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="addr-firstName" className={fieldLabel}>
            First Name
          </label>
          <input
            id="addr-firstName"
            className={fieldInput}
            value={draft.firstName}
            onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="addr-lastName" className={fieldLabel}>
            Last Name
          </label>
          <input
            id="addr-lastName"
            className={fieldInput}
            value={draft.lastName}
            onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="addr-company" className={fieldLabel}>
            Company <span className="normal-case">(optional)</span>
          </label>
          <input
            id="addr-company"
            className={fieldInput}
            value={draft.company}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="addr-line1" className={fieldLabel}>
            Address Line 1
          </label>
          <input
            id="addr-line1"
            className={fieldInput}
            value={draft.address1}
            onChange={(e) => setDraft({ ...draft, address1: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="addr-line2" className={fieldLabel}>
            Address Line 2 <span className="normal-case">(optional)</span>
          </label>
          <input
            id="addr-line2"
            className={fieldInput}
            value={draft.address2}
            onChange={(e) => setDraft({ ...draft, address2: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="addr-city" className={fieldLabel}>
            City
          </label>
          <input
            id="addr-city"
            className={fieldInput}
            value={draft.city}
            onChange={(e) => setDraft({ ...draft, city: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="addr-province" className={fieldLabel}>
            County / State
          </label>
          <input
            id="addr-province"
            className={fieldInput}
            value={draft.province}
            onChange={(e) => setDraft({ ...draft, province: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="addr-zip" className={fieldLabel}>
            Postcode
          </label>
          <input
            id="addr-zip"
            className={fieldInput}
            value={draft.zip}
            onChange={(e) => setDraft({ ...draft, zip: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="addr-country" className={fieldLabel}>
            Country
          </label>
          <input
            id="addr-country"
            className={fieldInput}
            value={draft.country}
            onChange={(e) => setDraft({ ...draft, country: e.target.value })}
            required
          />
        </div>
      </div>

      <label className="mt-5 inline-flex items-center gap-2.5 font-body text-[13px] text-brand-black">
        <input
          type="checkbox"
          checked={draft.isDefault}
          onChange={(e) => setDraft({ ...draft, isDefault: e.target.checked })}
          className="h-4 w-4 accent-brand-black"
        />
        Set as default address
      </label>

      {error ? <p className={errorText}>{error}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center bg-brand-black px-7 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save Address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center border border-brand-black px-7 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
