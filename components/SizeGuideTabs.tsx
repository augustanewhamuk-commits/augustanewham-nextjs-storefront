"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileSpreadsheet, FileText } from "lucide-react";

/* --- Size data (all measurements in inches) --- */

type TableData = {
  id: string;
  /** Short label for the tab. */
  tab: string;
  caption: string;
  unit?: string;
  groupHeader?: string;
  headers: string[];
  rows: string[][];
};

const TABLES: TableData[] = [
  {
    id: "shapewear",
    tab: "Shapewear",
    caption: "Shapewear",
    unit: "Inches",
    headers: ["Size", "UK", "Bust", "Waist", "Hip"],
    rows: [
      ["XXS–XS", "4/6", "31.5 – 33.5", "24 – 26", "34 – 36.5"],
      ["S/M", "8/10", "34 – 36", "26.5 – 28.5", "37 – 39"],
      ["L/XL", "12/14", "36.5 – 38.5", "29 – 31", "39.5 – 41.5"],
      ["2XL/3XL", "16/18", "39 – 41", "31.5 – 34.5", "42 – 44"],
      ["4XL/5XL", "20/22", "41.5 – 44.5", "35 – 38", "44.5 – 47.5"],
      ["5XL/6XL", "22/24", "45 – 48", "38.5 – 41.5", "48 – 51"],
      ["7XL/8XL", "24/26", "48.5 – 52", "42 – 45.5", "51.5 – 55"],
    ],
  },
  {
    id: "bodysuit",
    tab: "Bodysuit",
    caption: "Bodysuit Shapewear",
    unit: "Inches",
    headers: ["Size", "UK", "Bust", "Waist", "Hip"],
    rows: [
      ["S", "6/8", "36 – 38", "25 – 27", "35 – 37"],
      ["M", "10/12", "39 – 41", "31 – 33", "41 – 43"],
      ["L", "14/16", "42 – 44", "34 – 36", "44 – 46"],
      ["XL", "18/20", "45 – 47", "37 – 39", "47 – 49"],
      ["2XL", "22/24", "48 – 51", "40 – 42", "50 – 52"],
      ["3XL/4XL", "24/26", "51 – 54", "43 – 45", "51 – 53"],
      ["5XL", "26/28", "55 – 57", "46 – 48", "54 – 56"],
    ],
  },
  {
    id: "bralette",
    tab: "Bralette",
    caption: "Bralette",
    groupHeader: "Bust Measurement (Cup)",
    headers: ["Band Size (UK)", "A", "B", "C", "D", "DD"],
    rows: [
      ["32", "XS", "XS", "S", "S", "S"],
      ["34", "S", "S", "S", "M", "M"],
      ["36", "M", "M", "M", "L", "L"],
      ["38", "L", "L", "L", "XL", "XL"],
      ["40", "XL", "XL", "XL", "XXL", "XXL"],
      ["42", "XXL", "XXL", "XXL", "3XL", "3XL"],
    ],
  },
  {
    id: "brief",
    tab: "Brief",
    caption: "Shapewear Brief",
    unit: "Inches",
    headers: ["Size", "UK", "Waist", "Hip"],
    rows: [
      ["XXS", "6", "23.2", "34"],
      ["XS", "8", "24.8", "35"],
      ["S", "10", "26.8", "37"],
      ["M", "12", "28.7", "39"],
      ["L", "14", "31.7", "42"],
      ["XL", "16", "38.2", "49"],
      ["XXL", "18", "38.2", "49"],
    ],
  },
];

function SizeTable({ caption, unit, groupHeader, headers, rows }: TableData) {
  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-wordmark text-base uppercase tracking-[0.12em] text-brand-black">
          {caption}
        </h2>
        {unit ? (
          <span className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-gray">
            {unit}
          </span>
        ) : null}
      </div>

      <div className="overflow-x-auto border border-brand-light-gray">
        <table className="w-full table-fixed border-collapse font-body text-xs sm:table-auto sm:min-w-[34rem] sm:text-sm">
          <thead>
            {groupHeader ? (
              <tr>
                <th
                  className="border-b border-r border-brand-light-gray bg-brand-black px-2 py-2.5 text-left align-bottom font-medium uppercase tracking-[0.1em] text-brand-white sm:px-4 sm:py-3"
                  rowSpan={2}
                >
                  {headers[0]}
                </th>
                <th
                  className="border-b border-brand-light-gray bg-brand-black px-2 py-2 text-center font-medium uppercase tracking-[0.1em] text-brand-white sm:px-4"
                  colSpan={headers.length - 1}
                >
                  {groupHeader}
                </th>
              </tr>
            ) : null}
            <tr>
              {headers.map((h, i) =>
                groupHeader && i === 0 ? null : (
                  <th
                    key={h}
                    scope="col"
                    className={`border-b border-brand-light-gray bg-brand-black px-2 py-2.5 font-medium uppercase tracking-[0.1em] text-brand-white sm:px-4 sm:py-3 ${
                      i === 0 ? "text-left" : "text-center"
                    } ${i < headers.length - 1 ? "border-r border-brand-light-gray/30" : ""}`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={row[0]} className={r % 2 ? "bg-brand-off-white" : "bg-brand-white"}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={`border-b border-brand-light-gray px-2 py-2.5 text-brand-black sm:whitespace-nowrap sm:px-4 sm:py-3 ${
                      c === 0
                        ? "text-left font-medium"
                        : "text-center text-brand-gray"
                    } ${c < row.length - 1 ? "border-r border-brand-light-gray" : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --- Export helpers --- */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// An HTML-table workbook that Excel (and Google Sheets) opens natively as .xls.
function buildExcelHtml(): string {
  const sections = TABLES.map((t) => {
    const head: string[] = [];
    if (t.groupHeader) {
      head.push(
        `<tr><th>${escapeHtml(t.headers[0])}</th>` +
          `<th colspan="${t.headers.length - 1}">${escapeHtml(t.groupHeader)}</th></tr>`,
      );
      head.push(
        "<tr>" +
          t.headers
            .map((h, i) => (i === 0 ? "" : `<th>${escapeHtml(h)}</th>`))
            .join("") +
          "</tr>",
      );
    } else {
      head.push(
        "<tr>" + t.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("") + "</tr>",
      );
    }
    const body = t.rows
      .map(
        (row) =>
          "<tr>" + row.map((c) => `<td>${escapeHtml(c)}</td>`).join("") + "</tr>",
      )
      .join("");
    const title = escapeHtml(t.unit ? `${t.caption} (${t.unit})` : t.caption);
    return `<h3>${title}</h3><table border="1" cellspacing="0" cellpadding="6">${head.join("")}${body}</table><br/>`;
  });

  return (
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"><style>th{background:#000;color:#fff;text-align:center}` +
    `td{text-align:center}table{border-collapse:collapse}</style></head>` +
    `<body><h2>Augusta Newham — Size Guide</h2>${sections.join("")}</body></html>`
  );
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([`﻿${content}`], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function SizeGuideTabs() {
  const [active, setActive] = useState(TABLES[0].id);
  const [exportOpen, setExportOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close the export menu on outside click / Escape.
  useEffect(() => {
    if (!exportOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!exportRef.current?.contains(e.target as Node)) setExportOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExportOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [exportOpen]);

  const exportExcel = () => {
    download(
      buildExcelHtml(),
      "augusta-newham-size-guide.xls",
      "application/vnd.ms-excel;charset=utf-8;",
    );
    setExportOpen(false);
  };

  const exportPdf = () => {
    setExportOpen(false);
    // Let the menu close before the print dialog takes over.
    setTimeout(() => window.print(), 0);
  };

  // Up/down arrow navigation across the vertical tablist (WAI-ARIA pattern).
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const dir = e.key === "ArrowDown" ? 1 : -1;
    const next = (index + dir + TABLES.length) % TABLES.length;
    setActive(TABLES[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      {/* Export menu — single button, two formats. */}
      <div className="mb-5 flex justify-end print:hidden">
        <div ref={exportRef} className="relative">
          <button
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={exportOpen}
            className="inline-flex items-center gap-2 border border-brand-black px-4 py-2 font-body text-[12px] uppercase tracking-[0.08em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white"
          >
            Export
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${exportOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          {exportOpen ? (
            <div
              role="menu"
              aria-label="Export size guide"
              className="absolute right-0 top-full z-30 mt-1 w-48 border border-brand-black bg-brand-white py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={exportExcel}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-body text-[13px] text-brand-black transition-colors hover:bg-brand-off-white"
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                Excel (.xls)
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={exportPdf}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-body text-[13px] text-brand-black transition-colors hover:bg-brand-off-white"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                PDF (.pdf)
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Vertical tabs (left) + active panel (right). */}
      <div className="flex flex-col gap-8 sm:flex-row print:hidden">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Size charts"
          className="flex shrink-0 flex-row gap-1 overflow-x-auto border-brand-light-gray sm:w-44 sm:flex-col sm:gap-0 sm:border-l"
        >
          {TABLES.map((t, i) => {
            const selected = t.id === active;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(t.id)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
                className={`whitespace-nowrap px-4 py-2.5 text-left font-wordmark text-[13px] uppercase tracking-[0.08em] transition-colors sm:-ml-px sm:border-l-2 ${
                  selected
                    ? "border-brand-black font-medium text-brand-black sm:bg-brand-off-white"
                    : "border-transparent text-brand-gray hover:text-brand-black"
                }`}
              >
                {t.tab}
              </button>
            );
          })}
        </div>

        <div className="min-w-0 flex-1">
          {TABLES.map((t) => (
            <div
              key={t.id}
              role="tabpanel"
              id={`panel-${t.id}`}
              aria-labelledby={`tab-${t.id}`}
              hidden={t.id !== active}
            >
              <SizeTable {...t} />
            </div>
          ))}
        </div>
      </div>

      {/* Print/PDF: every chart, so the exported document is the full guide. */}
      <div className="hidden print:block" aria-hidden="true">
        {TABLES.map((t) => (
          <div key={t.id} className="mb-8 break-inside-avoid">
            <SizeTable {...t} />
          </div>
        ))}
      </div>
    </div>
  );
}
