import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { cart, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/products";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Smart Shop" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart();
  const nav = useNavigate();
  const subtotal = items.reduce((a, b) => a + b.product.price * b.qty, 0);
  const shipping = items.length ? 9.99 : 0;
  const total = subtotal + shipping;

  const checkout = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("smartshop_token") : null;
    if (!token) { toast.error("Please sign in to checkout"); nav({ to: "/login" }); return; }
    
    try {
      const res = await fetch("http://20.198.72.134/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          // The backend expects product_id to match the product's _id
          items: items.map(i => ({ product_id: i.product.id, qty: i.qty })),
          payment_method: "transfer_bank",
          shipping_cost: shipping,
          address: "Surabaya, ITS"
        })
      });

      if (res.ok) {
        cart.clear();
        toast.success("Order placed successfully!");
        setTimeout(() => nav({ to: "/orders" }), 600);
      } else {
        const errData = await res.json().catch(() => null);
        toast.error(errData?.error || "Failed to place order.");
        if (res.status === 401) {
          localStorage.removeItem("smartshop_token");
          nav({ to: "/login" });
        }
      }
    } catch (e) {
      toast.error("Connection error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-page py-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-border p-16 text-center">
            <div className="size-16 mx-auto rounded-full bg-secondary grid place-items-center mb-4">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground text-sm mt-1">Add a few items to get started.</p>
            <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Continue shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            <div className="rounded-3xl border border-border overflow-hidden">
              {items.map((i, idx) => (
                <div key={i.product.id} className={`flex gap-4 p-4 md:p-6 items-center ${idx !== items.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="size-20 md:size-24 rounded-2xl bg-secondary overflow-hidden shrink-0">
                    <img src={i.product.image} alt={i.product.name} className="size-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{i.product.category}</div>
                    <h3 className="font-medium text-sm truncate">{i.product.name}</h3>
                    <div className="mt-1 font-semibold">${formatPrice(i.product.price)}</div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
                    <button onClick={() => cart.setQty(i.product.id, i.qty - 1)} className="size-7 grid place-items-center rounded-full hover:bg-background"><Minus className="size-3" /></button>
                    <span className="w-8 text-center text-sm font-medium">{i.qty}</span>
                    <button onClick={() => cart.setQty(i.product.id, i.qty + 1)} className="size-7 grid place-items-center rounded-full hover:bg-background"><Plus className="size-3" /></button>
                  </div>
                  <button onClick={() => cart.remove(i.product.id)} className="size-9 grid place-items-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <aside className="rounded-3xl border border-border p-6 h-fit sticky top-24">
              <h2 className="font-display text-lg font-bold">Order Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Items</dt><dd>{items.reduce((a, b) => a + b.qty, 0)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>${formatPrice(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>${formatPrice(shipping)}</dd></div>
                <div className="h-px bg-border my-3" />
                <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>${formatPrice(total)}</dd></div>
              </dl>
              <button onClick={checkout} className="mt-6 w-full py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">Checkout</button>
              <Link to="/" className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground">Continue shopping</Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
