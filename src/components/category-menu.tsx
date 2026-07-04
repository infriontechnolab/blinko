import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Leaf,
  Wheat,
  Egg,
  Cookie,
  Soup,
  type LucideIcon,
} from "lucide-react";
import { categories } from "@/lib/mock-data";

// One glyph per department. Falls back to Leaf for any unmapped id.
const departmentIcons: Record<string, LucideIcon> = {
  produce: Leaf,
  pantry: Wheat,
  dairy: Egg,
  snacks: Cookie,
  ready: Soup,
};

export function CategoryMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:opacity-90"
      >
        <LayoutGrid className="size-4" />
        Departments
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-xl"
        >
          {categories.map((c) => {
            const Icon = departmentIcons[c.id] ?? Leaf;
            return (
              <Link
                key={c.id}
                to="/browse"
                search={{ category: c.id }}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground group-hover:text-primary">
                    {c.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">{c.tagline}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}

          <Link
            to="/browse"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl border-t border-border px-2.5 pb-1 pt-3 text-center text-xs font-semibold text-primary hover:underline"
          >
            Browse everything →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
