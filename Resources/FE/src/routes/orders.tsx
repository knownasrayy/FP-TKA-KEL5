import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { formatPrice } from "@/lib/products";
import { Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Order History — Smart Shop" }] }),
  component: OrdersPage,
});

type Order = { id: string; date: string; items: { name: string; qty: number }[]; total: number; status: string };

const statusStyle: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Decode JWT to check if user has admin role
    const token = localStorage.getItem("smartshop_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error("Failed to parse token");
      }
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("smartshop_token");
      if (!token) return;
      try {
        const res = await fetch("http://20.198.72.134/api/orders", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const response = await res.json();
          // Backend may return { data: [...] } or a plain array
          const dataArray = Array.isArray(response) ? response : (response.data || []);
          // Map backend orders data
          const mapped = dataArray.map((o: any) => ({
            id: o.order_id || o._id || o.id,
            date: o.created_at || new Date().toISOString(),
            // Assuming we only get product_id back. In a real app we'd populate name, but for now we format it
            items: o.items.map((i:any) => ({ name: `Item ${i.product_id.substring(0, 4)}`, qty: i.qty })),
            total: o.total_price || o.total || 0,
            status: o.status || "Pending"
          }));
          // Sort newest first
          setOrders(mapped.reverse());
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem("smartshop_token");
    if (!token) return;
    try {
      const res = await fetch(`http://20.198.72.134/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });
      if (res.ok) {
        toast.success(`Order ${orderId.substring(0,6)}... status updated to ${newStatus}`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        toast.error("Failed to update status. Only admins can do this.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const handleRefreshStatus = async (orderId: string) => {
    console.log("handleRefreshStatus called for:", orderId);
    const token = localStorage.getItem("smartshop_token");
    if (!token) {
      console.error("No token found!");
      return;
    }
    try {
      console.log("Fetching status from API...");
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      console.log("Fetch response:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Order data:", data);
        toast.info(`Status pesanan: ${data.status.toUpperCase()}`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.status } : o));
      } else {
        console.error("Order not found or error:", await res.text());
        toast.error("Order not found!");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      toast.error("Network error.");
    }
  };

  const filtered = orders.filter(o =>
    (filter === "All" || o.status === filter) &&
    (q === "" || o.id.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-page py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Order History</h1>
            <p className="text-muted-foreground text-sm mt-1">Track and manage your orders</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2.5">
              <Search className="size-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order ID" className="bg-transparent outline-none text-sm w-40" />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-secondary rounded-full px-4 py-2.5 text-sm outline-none">
              {["All", "Pending", "Processing", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-border p-16 text-center">
            <h2 className="font-display text-xl font-bold">No orders yet</h2>
            <p className="text-muted-foreground text-sm mt-1">Place an order to see it here.</p>
            <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Start shopping</Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr] gap-4 px-6 py-4 bg-secondary text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <div>Order ID</div><div>Date</div><div>Products</div><div>Total</div><div>Status</div>
            </div>
            {filtered.map((o, idx) => (
              <div key={o.id} className={`grid grid-cols-[1fr_1fr_2fr_1fr_1fr] gap-4 px-6 py-5 items-center text-sm ${idx !== filtered.length - 1 ? "border-b border-border" : ""}`}>
                <button onClick={() => handleRefreshStatus(o.id)} className="font-mono font-semibold text-left hover:text-primary transition-colors cursor-pointer" title="Click to refresh status">
                  {o.id}
                </button>
                <div className="text-muted-foreground">{new Date(o.date).toLocaleDateString()}</div>
                <div className="truncate text-muted-foreground">{o.items.map(i => `${i.name} ×${i.qty}`).join(", ")}</div>
                <div className="font-semibold">${formatPrice(o.total)}</div>
                <div>
                  {isAdmin ? (
                    <select
                      value={o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer outline-none ${statusStyle[o.status.charAt(0).toUpperCase() + o.status.slice(1)] || statusStyle["Pending"]}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[o.status.charAt(0).toUpperCase() + o.status.slice(1)] || statusStyle["Pending"]}`}>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
