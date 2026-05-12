import * as React from "react";
import { Check, Minus, X } from "lucide-react";
import { landing } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

function renderValue(v: string) {
  if (v === "Yes") return <Check className="size-4 text-primary" aria-label="Yes" />;
  if (v === "No") return <X className="size-4 text-muted-foreground/60" aria-label="No" />;
  if (v === "Partial" || v === "Basic")
    return <Minus className="size-4 text-amber-500" aria-label="Partial" />;
  return <span className="text-xs">{v}</span>;
}

export function ComparisonTableSection() {
  const t = landing.comparison_table;
  return (
    <section className="border-y border-border/60 bg-muted/30 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            How Calorisync stacks up across the dimensions that actually matter.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Feature
                  </th>
                  {t.columns.map((col, i) => (
                    <th
                      key={col}
                      className={cn(
                        "px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider sm:px-5",
                        i === 0 && "bg-primary/8 text-primary",
                      )}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row, ri) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-border last:border-b-0 transition-colors",
                      ri % 2 === 0 ? "" : "bg-muted/20",
                    )}
                  >
                    <td className="px-5 py-3.5 text-left font-medium">{row.feature}</td>
                    {row.values.map((v, vi) => (
                      <td
                        key={`${row.feature}-${vi}`}
                        className={cn(
                          "px-3 py-3.5 text-center sm:px-5",
                          vi === 0 && "bg-primary/5",
                        )}
                      >
                        <span className="inline-flex items-center justify-center">
                          {renderValue(v)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
