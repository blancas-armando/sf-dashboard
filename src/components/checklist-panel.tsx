"use client";

import { useState } from "react";
import type { ChecklistItem } from "@/lib/types";
import { Panel } from "./panel";

export function ChecklistPanel({ items }: { items: ChecklistItem[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allChecked = checked.size === items.length;

  return (
    <Panel title="Before You Leave">
      <div className="flex gap-6">
        {items.map((item) => {
          const done = checked.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="group flex items-center gap-2 transition-opacity"
            >
              <div
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                  done
                    ? "border-foreground/20 bg-foreground/10"
                    : "border-card-border group-hover:border-foreground/30"
                }`}
              >
                {done && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="text-foreground/50"
                  >
                    <path
                      d="M2 5.5L4 7.5L8 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-xs transition-colors ${
                  done ? "text-muted/40 line-through" : "text-foreground/70"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {allChecked && (
        <p className="mt-2 text-xs text-muted/40">All set</p>
      )}
    </Panel>
  );
}
