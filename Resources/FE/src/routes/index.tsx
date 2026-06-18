import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Toaster } from "@/components/ui/sonner";
import { type Product } from "@/lib/products";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import heroFashion from "@/assets/hero-fashion.jpg";
import promoExclusive from "@/assets/promo-exclusive.jpg";
import promoSunglasses from "@/assets/promo-sunglasses.jpg";
import bannerSummer from "@/assets/banner-summer.jpg";
import bannerPhone from "@/assets/banner-phone.jpg";
import bannerClothing from "@/assets/banner-clothing.jpg";

const categories = [
  { name: "Clothing", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=200&fit=crop" },
  { name: "Accessories", image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=200&h=200&fit=crop" },
  { name: "Phone", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop" },
  { name: "Computers", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop" },
  { name: "Cosmetics", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=200&h=200&fit=crop" },
  { name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop" },
  { name: "Sneakers", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop" },
  { name: "Bags", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&h=200&fit=crop" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Shop — Premium Fashion & Lifestyle Marketplace" },
      { name: "description", content: "Discover curated fashion, accessories, and electronics at Smart Shop. Premium quality, minimalist style, fast delivery." },
      { property: "og:title", content: "Smart Shop — Premium Marketplace" },
      { property: "og:description", content: "Curated fashion, accessories & electronics with premium minimalist style." },
    ],
  }),
  component: Home,
});

function SectionHeader({ title, action = "VIEW ALL" }: { title: string; action?: string }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
      <button className="text-xs font-semibold tracking-wider text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        {action} <ArrowRight className="size-3" />
      </button>
    </div>
  );
}

function Home() {
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const perPage = 20;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session storage first for network optimization
    const cached = sessionStorage.getItem("cached_products");
    if (cached) {
      setProductsData(JSON.parse(cached));
      setIsLoading(false);
      return;
    }

    fetch("http://20.198.72.134/api/products?limit=20")
      .then(res => res.json())
      .then(response => {
        // Map backend product data to our frontend Product interface
        const dataArray = Array.isArray(response) ? response : (response.data || []);
        const mapped = dataArray.map((p: any, i: number) => {
          const cats = ['Clothing', 'Accessories', 'Electronics', 'Cosmetics', 'Phone', 'Computers'];
          const imgIds = ["1523381210434-271e8be1f52b", "1509319117193-57bab727e09d", "1511707171634-5f897ff02aa9", "1496181133206-80ce9b88a853"];
          return {
            id: p._id || p.id,
            name: p.name,
            category: p.category || cats[i % cats.length],
            price: p.price,
            oldPrice: p.price * 1.2,
            rating: p.rating || 4.5,
            reviews: p.rating_count || 120,
            image: p.image_url || `https://images.unsplash.com/photo-${imgIds[i % imgIds.length]}?w=400&h=400&fit=crop`,
          };
        });
        setProductsData(mapped);
        sessionStorage.setItem("cached_products", JSON.stringify(mapped));
      })
      .catch(err => console.error("Failed to fetch products:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(productsData.length / perPage));
  const visible = productsData.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-page py-8 space-y-16">
        {/* HERO */}
        <section className="grid lg:grid-cols-[2fr_1fr] gap-5">
          <div className="relative rounded-3xl overflow-hidden bg-[image:var(--gradient-hero)] min-h-[420px] p-8 md:p-12 flex">
            <div className="relative z-10 flex flex-col justify-between max-w-sm">
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-foreground/70">
                <span className="inline-block w-12 h-6 bg-[repeating-linear-gradient(90deg,#000_0_2px,transparent_2px_4px)]" />
                LIMITED EDITION
              </div>
              <div>
                <div className="font-display text-6xl md:text-7xl font-black leading-none">50% <span className="text-2xl md:text-3xl font-medium align-top">OFF</span></div>
                <p className="mt-4 text-sm text-foreground/70 max-w-xs">Discover quality fashion that reflects your style and makes everyday living more enjoyable.</p>
                <button className="mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-wider hover:opacity-90 transition">EXPLORE NOW</button>
              </div>
            </div>
            <img src={heroFashion} alt="Featured fashion model" width={640} height={640} className="absolute right-0 bottom-0 top-0 h-full w-1/2 object-cover object-center" />
          </div>

          <div className="grid grid-rows-2 gap-5">
            <div className="relative rounded-3xl overflow-hidden bg-blush p-6 flex flex-col justify-between" style={{ background: "oklch(0.94 0.04 20)" }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-semibold tracking-widest text-foreground/60">FOR NEW COMMERCE</div>
                  <h3 className="font-display text-2xl font-bold mt-1 leading-tight">EXCLUSIVE<br />OFFER</h3>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-xs text-foreground/70 max-w-[150px]">Welcome to new commerce, special offer claim now.</p>
                <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs">Explore</button>
              </div>
              <img src={promoExclusive} alt="Promo" width={300} height={200} loading="lazy" className="absolute right-0 bottom-0 h-full w-1/2 object-cover opacity-80" />
            </div>
            <div className="relative rounded-3xl overflow-hidden bg-secondary p-6 flex flex-col justify-between">
              <div className="flex justify-between text-[10px] font-semibold tracking-widest text-muted-foreground">
                <span>NEW ARRIVAL</span><span>2026</span>
              </div>
              <img src={promoSunglasses} alt="Sunglasses" width={300} height={150} loading="lazy" className="mx-auto h-24 object-contain" />
              <div className="flex items-end justify-between">
                <h3 className="font-display text-xl font-bold leading-tight">BROWSE<br />ACCESSORIES</h3>
                <div className="flex gap-1">
                  <button className="size-7 grid place-items-center rounded-full bg-background border border-border"><ChevronLeft className="size-3.5" /></button>
                  <button className="size-7 grid place-items-center rounded-full bg-primary text-primary-foreground"><ChevronRight className="size-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section>
          <h2 className="font-display text-xl md:text-2xl font-bold mb-6">Explore Popular Categories</h2>
          <section className="flex items-center justify-between gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {categories.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group">
                <div className="size-24 md:size-32 rounded-full overflow-hidden bg-secondary transition-transform duration-300 group-hover:scale-105 shadow-[var(--shadow-soft)] group-hover:shadow-[var(--shadow-card)]">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{c.name}</span>
              </div>
            ))}
          </section>
        </section>

        {/* TODAY'S BEST DEALS */}
        <section>
          <SectionHeader title="Today's Best Deals For You!" action="VIEW ALL" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : productsData.slice(0, 5).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* PROMO BANNERS */}
        <section className="grid md:grid-cols-3 gap-5">
          {[bannerSummer, bannerPhone, bannerClothing].map((src, i) => (
            <div key={i} className="relative rounded-3xl overflow-hidden aspect-[4/3] group">
              <img src={src} alt="Promotion" width={500} height={375} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
              <button className="absolute bottom-4 left-4 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium">Shop now</button>
            </div>
          ))}
        </section>

        {/* ELECTRONICS & BEAUTY */}
        <section>
          <SectionHeader title="Electronics & Beauty Products" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : productsData.slice(5, 10).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* AI SEARCH FEATURE */}
        <section className="relative rounded-3xl overflow-hidden p-8 md:p-16 bg-[image:var(--gradient-hero)]">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="size-8 rounded-xl bg-[image:var(--gradient-accent)] grid place-items-center text-primary-foreground text-sm font-bold">S</div>
              <span className="font-display font-bold text-lg">Smart Shop</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold">AI-Powered Shopping Experience</h3>
            <div className="mt-6 flex gap-2 bg-background rounded-full p-1.5 shadow-[var(--shadow-glow)]">
              <input placeholder="Search products with AI..." className="flex-1 px-5 bg-transparent outline-none text-sm" />
              <button className="px-6 py-3 rounded-full bg-[image:var(--gradient-accent)] text-primary-foreground text-xs font-semibold">Search</button>
            </div>
          </div>
        </section>

        {/* TOP DEALS IN CLOTHS */}
        <section>
          <SectionHeader title="Top Deals In Cloths" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : productsData.slice(8, 13).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* BEST SELLERS */}
        <section>
          <SectionHeader title="Best Sellers In Accessories" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : productsData.slice(13, 18).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* ALL PRODUCTS PAGINATED */}
        <section>
          <SectionHeader title="All Products" action={`PAGE ${page + 1} / ${totalPages}`} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {isLoading
              ? Array.from({ length: perPage }).map((_, i) => <SkeletonCard key={i} />)
              : visible.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-8 flex justify-center gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="size-10 grid place-items-center rounded-full border border-border disabled:opacity-30"><ChevronLeft className="size-4" /></button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`size-10 rounded-full text-sm font-medium ${page === i ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1} className="size-10 grid place-items-center rounded-full border border-border disabled:opacity-30"><ChevronRight className="size-4" /></button>
          </div>
        </section>

        {/* BRAND ROW */}
        <section className="flex flex-wrap items-center justify-around gap-8 py-8 border-y border-border opacity-70">
          {["COOL CLUB", "celio", "LC WAIKIKI", "be camaïeu", "sinsay"].map((b) => (
            <span key={b} className="font-display text-xl md:text-2xl font-bold tracking-tight">{b}</span>
          ))}
        </section>

        {/* SERVICE BADGES */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { t: "Free in-store pick up", d: "24/7 Amazing Services" },
            { t: "Free Shipping", d: "24/7 Amazing Services" },
            { t: "Flexible Payment", d: "24/7 Amazing Services" },
            { t: "Convenient help", d: "24/7 Amazing Services" },
          ].map((s) => (
            <div key={s.t} className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-secondary grid place-items-center">🎁</div>
              <div>
                <div className="text-sm font-semibold">{s.t}</div>
                <div className="text-xs text-muted-foreground">{s.d}</div>
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
      <Toaster />
      <div className="hidden">
        <Link to="/cart">cart</Link><Link to="/login">login</Link><Link to="/orders">orders</Link>
      </div>
    </div>
  );
}
