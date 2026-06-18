import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Smart Shop" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("smartshop_token");
      if (!token) {
        toast.error("Unauthorized access. Please login as admin.");
        nav({ to: "/login" });
        return;
      }

      try {
        const res = await fetch("http://20.198.72.134/admin/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          toast.error("Failed to load admin stats");
          if (res.status === 401 || res.status === 403) {
            nav({ to: "/" });
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Connection error to backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [nav]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#fcf8fb]">
        <div className="text-xl font-bold animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  // Fallback defaults if stats null
  const data = stats?.summary || { total_orders: 0, total_revenue: 0, total_users: 0, total_products: 0 };

  return (
    <div className="min-h-screen bg-[#fcf8fb] text-[#1c1b1d] font-sans pb-32">
      {/* Top Nav */}
      <header className="flex flex-col w-full sticky top-0 z-50 bg-[#fcf8fb] border-b border-[#e5e1e4]">
        <div className="max-w-[1440px] w-full mx-auto px-4 md:px-10 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-purple-600 font-bold text-xl">S</div>
            <a className="text-xl md:text-2xl font-extrabold tracking-tighter" href="/">
              SMART SHOP<span className="text-[#AEAFB3] text-sm tracking-normal font-normal ml-2">ADMIN</span>
            </a>
          </div>
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <input className="w-full bg-[#ebe7e9] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-black transition-all" placeholder="Search orders, products, customers..." type="text"/>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-l border-[#e5e1e4] pl-6">
              <img alt="Admin Avatar" className="w-8 h-8 rounded-full border border-[#e5e1e4]" src="https://ui-avatars.com/api/?name=Admin&background=1a1930&color=fff"/>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold leading-tight">System Admin</p>
                <p className="text-[10px] text-[#47464d] tracking-wider font-bold">SUPER ADMIN</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black">Overview</h1>
            <p className="text-[#47464d] text-sm mt-1">Real-time statistics from MongoDB backend.</p>
          </div>
          <button className="bg-black text-white rounded-full px-6 py-2 text-sm font-semibold hover:bg-gray-800 transition-colors">
            Export Report
          </button>
        </div>

        {/* Bento Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="bg-white border border-[#e5e1e4] rounded-xl p-6 hover:shadow-lg transition-all">
            <p className="text-[12px] tracking-wider font-bold text-[#47464d] mb-4">TOTAL REVENUE</p>
            <h3 className="text-3xl font-bold text-black mb-2">Rp {formatPrice(data.total_revenue || 0)}</h3>
            <div className="flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full font-semibold">
              +12.5% vs last month
            </div>
          </div>
          
          {/* Orders */}
          <div className="bg-white border border-[#e5e1e4] rounded-xl p-6 hover:shadow-lg transition-all">
            <p className="text-[12px] tracking-wider font-bold text-[#47464d] mb-4">TOTAL ORDERS</p>
            <h3 className="text-3xl font-bold text-black mb-2">{(data.total_orders || 0).toLocaleString()}</h3>
            <div className="flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full font-semibold">
              +8.2% vs last month
            </div>
          </div>
          
          {/* Users */}
          <div className="bg-white border border-[#e5e1e4] rounded-xl p-6 hover:shadow-lg transition-all">
            <p className="text-[12px] tracking-wider font-bold text-[#47464d] mb-4">REGISTERED USERS</p>
            <h3 className="text-3xl font-bold text-black mb-2">{(data.total_users || 0).toLocaleString()}</h3>
            <div className="flex items-center text-sm text-[#ba1a1a] bg-[#ffdad6] w-fit px-2 py-0.5 rounded-full font-semibold">
              -2.4% vs last month
            </div>
          </div>
          
          {/* Products */}
          <div className="bg-white border border-[#e5e1e4] rounded-xl p-6 hover:shadow-lg transition-all">
            <p className="text-[12px] tracking-wider font-bold text-[#47464d] mb-4">ACTIVE PRODUCTS</p>
            <h3 className="text-3xl font-bold text-black mb-2">{(data.total_products || 0).toLocaleString()}</h3>
            <div className="flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full font-semibold">
              +1.1% vs last month
            </div>
          </div>
        </section>

        {/* Charts Mockup translated from Stitch */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-[#e5e1e4] rounded-xl p-6 h-[400px] flex flex-col justify-center items-center text-gray-400">
            <div className="text-4xl mb-4">📊</div>
            <p className="font-bold">Revenue Chart (Coming Soon)</p>
          </div>
          <div className="bg-white border border-[#e5e1e4] rounded-xl p-6 h-[400px] flex flex-col justify-center items-center text-gray-400">
            <div className="text-4xl mb-4">🍩</div>
            <p className="font-bold">Sales by Category (Coming Soon)</p>
          </div>
        </section>

      </main>
    </div>
  );
}
