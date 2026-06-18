import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, LogOut, LayoutDashboard, Package } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useState, useEffect, useRef } from "react";

const navLinks = [
  { label: "All Category", to: "/" },
  { label: "New Arrival", to: "/" },
  { label: "Sale", to: "/", active: true },
  { label: "Women", to: "/" },
  { label: "Men", to: "/" },
  { label: "Sneakers", to: "/" },
  { label: "Store Location", to: "/" },
  { label: "Contact Us", to: "/" },
];

export function Navbar() {
  const items = useCart();
  const count = items.reduce((a, b) => a + b.qty, 0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("smartshop_token") : null;
    setLoggedIn(!!token);

    // Listen for storage changes (login/logout in another tab)
    const handler = () => {
      const t = localStorage.getItem("smartshop_token");
      setLoggedIn(!!t);
    };
    window.addEventListener("storage", handler);
    // Also poll once a second to catch same-tab changes (login redirect)
    const interval = setInterval(handler, 1000);
    return () => { window.removeEventListener("storage", handler); clearInterval(interval); };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smartshop_token");
    setLoggedIn(false);
    setMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
      <div className="container-page py-4 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="size-8 rounded-xl bg-[image:var(--gradient-accent)] grid place-items-center text-primary-foreground text-sm font-bold">S</div>
          <span className="font-display font-bold text-lg tracking-tight">Smart Shop</span>
        </Link>

        <div className="flex-1 max-w-xl hidden md:flex items-center gap-2 bg-secondary rounded-full px-4 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input placeholder="Search products, brands, categories..." className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <Link to="/cart" className="relative size-10 grid place-items-center rounded-full hover:bg-secondary transition">
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 size-5 grid place-items-center rounded-full bg-accent text-accent-foreground text-[10px] font-semibold">{count}</span>
            )}
          </Link>

          {loggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-secondary transition"
              >
                <div className="size-7 rounded-full bg-emerald-500 grid place-items-center">
                  <User className="size-3.5 text-white" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">Admin</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-background border border-border shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold">System Admin</p>
                    <p className="text-xs text-muted-foreground">admin1@tka.its.ac.id</p>
                  </div>
                  <div className="py-1">
                    <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition">
                      <Package className="size-4 text-muted-foreground" /> My Orders
                    </Link>
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition">
                      <LayoutDashboard className="size-4 text-muted-foreground" /> Admin Dashboard
                    </Link>
                  </div>
                  <div className="border-t border-border py-1">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm w-full hover:bg-destructive/10 text-destructive transition">
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-secondary transition">
              <div className="size-7 rounded-full bg-[image:var(--gradient-accent)] grid place-items-center">
                <User className="size-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Sign in</span>
            </Link>
          )}
          <button className="md:hidden size-10 grid place-items-center rounded-full hover:bg-secondary"><Menu className="size-5" /></button>
        </div>
      </div>

      <nav className="container-page pb-3 hidden md:flex items-center gap-1 text-sm overflow-x-auto">
        {navLinks.map((n) => (
          <Link key={n.label} to={n.to} className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${n.active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
