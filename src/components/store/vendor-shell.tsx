import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  Package,
  ClipboardList,
  Boxes,
  CalendarClock,
  Tag,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  Menu,
  Bell,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { BRAND } from "@/lib/brand";
import { stores } from "@/lib/mock-data";
import { storeLogoUrl } from "@/components/store-card";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { useVendorOrders } from "@/lib/store/vendor-orders-store";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/store/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/store/orders", label: "Orders", icon: ClipboardList },
  { to: "/store/products", label: "Products", icon: Package },
  { to: "/store/inventory", label: "Inventory", icon: Boxes },
  { to: "/store/slots", label: "Delivery Slots", icon: CalendarClock },
  { to: "/store/coupons", label: "Coupons", icon: Tag },
  { to: "/store/reports", label: "Reports", icon: BarChart3 },
  { to: "/store/payouts", label: "Payouts", icon: Wallet },
  { to: "/store/profile", label: "Store Profile", icon: Settings },
] as const;

export function VendorShell({ children }: { children: ReactNode }) {
  const { session, logout } = useVendorAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const store = stores.find((s) => s.id === session?.storeId);
  const orders = useVendorOrders(session?.storeId ?? "");
  const pendingCount = orders.filter((o) => o.vendorStatus === "placed").length;
  const [navOpen, setNavOpen] = useState(false);

  if (!store) return <>{children}</>;

  const doLogout = () => {
    logout();
    navigate({ to: "/store/login" });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/40">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <SidebarContent
          store={store}
          pathname={pathname}
          pendingCount={pendingCount}
          onLogout={doLogout}
        />
      </aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Vendor navigation</SheetTitle>
          <SidebarContent
            store={store}
            pathname={pathname}
            pendingCount={pendingCount}
            onLogout={doLogout}
            onNavigate={() => setNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
              className="grid size-9 place-items-center rounded-lg border border-border text-foreground"
            >
              <Menu className="size-4.5" />
            </button>
            <img src={BRAND.icon} alt={`${BRAND.name} logo`} className="size-7 rounded-md" />
          </div>

          <span className="hidden md:block" />

          <div className="flex items-center gap-3">
            <Link
              to="/store/orders"
              aria-label="Orders"
              className="relative grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <Bell className="size-4.5" />
              {pendingCount > 0 ? (
                <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-sale font-mono text-[9px] font-bold text-sale-foreground">
                  {pendingCount}
                </span>
              ) : null}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-muted">
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-white p-1">
                  <img
                    src={storeLogoUrl(store)}
                    alt={`${store.name} logo`}
                    className="size-full object-contain"
                  />
                </span>
                <span className="hidden text-sm font-semibold sm:block">{store.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{store.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={doLogout}>
                  <LogOut className="size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function SidebarContent({
  store,
  pathname,
  pendingCount,
  onLogout,
  onNavigate,
}: {
  store: (typeof stores)[number];
  pathname: string;
  pendingCount: number;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5">
        <img
          src={BRAND.icon}
          alt={`${BRAND.name} logo`}
          className="size-9 shrink-0 rounded-lg object-contain"
        />
        <span className="text-xl font-extrabold leading-none tracking-tight">
          <span className="text-foreground">{BRAND.wordmarkPrefix}</span>
          <span className="text-primary">{BRAND.wordmarkSuffix}</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4.5" />
              {item.label}
              {item.to === "/store/orders" && pendingCount > 0 ? (
                <span className="ml-auto grid size-5 place-items-center rounded-full bg-sale font-mono text-[10px] font-bold text-sale-foreground">
                  {pendingCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <div className="rounded-2xl bg-muted/60 p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-white p-1">
              <img
                src={storeLogoUrl(store)}
                alt={`${store.name} logo`}
                className="size-full object-contain"
              />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{store.name}</p>
              <p className="text-xs text-muted-foreground">Vendor Portal</p>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4.5" />
          Logout
        </button>
      </div>
    </div>
  );
}
