import { memo } from "react";
import { Heart, Star } from "lucide-react";
import { cart, type CartItem } from "@/lib/cart-store";
import { formatPrice, type Product } from "@/lib/products";
import { toast } from "sonner";

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative rounded-2xl bg-card border border-border/60 overflow-hidden transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <div className="relative aspect-square bg-secondary overflow-hidden">
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" width={400} height={400} className="size-full object-cover transition duration-500 group-hover:scale-105" />
        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold tracking-wider">{product.badge}</span>
        )}
        <button aria-label="wishlist" className="absolute top-3 right-3 size-8 grid place-items-center rounded-full bg-background/90 backdrop-blur hover:bg-accent hover:text-accent-foreground transition">
          <Heart className="size-4" />
        </button>
        <button
          onClick={() => { cart.add(product); toast.success("Added to cart", { description: product.name }); }}
          className="absolute inset-x-3 bottom-3 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
        >
          Add to cart
        </button>
      </div>
      <div className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{product.category}</div>
        <h3 className="mt-1 text-sm font-medium line-clamp-2 min-h-10">{product.name}</h3>
        <div className="mt-2 flex items-center gap-1 text-xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`size-3 ${i < Math.round(product.rating) ? "fill-accent text-accent" : "text-muted"}`} />
          ))}
          <span className="text-muted-foreground ml-1">({product.reviews})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold">${formatPrice(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-muted-foreground line-through">${formatPrice(product.oldPrice)}</span>}
        </div>
      </div>
    </div>
  );
});

export type { CartItem };
