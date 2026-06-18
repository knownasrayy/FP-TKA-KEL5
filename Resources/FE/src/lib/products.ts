export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
};

const seeds = [
  { name: "Regular 100% Linen Shirt - Sage Green", category: "Clothing", price: 79.5, q: "linen-shirt-sage" },
  { name: "Portable Bluetooth Headphone", category: "Electronics", price: 205.9, q: "pink-headphones" },
  { name: "Maximal Silky Matte Lipstick", category: "Cosmetics", price: 36.99, q: "lipstick-tube" },
  { name: "MacBook Pro 14-inch M3 Chip", category: "Computers", price: 999.09, q: "macbook-pro" },
  { name: "Water Weight SPF 30 Foundation", category: "Cosmetics", price: 35.0, q: "foundation-bottle" },
  { name: "Portable Bluetooth Speaker", category: "Electronics", price: 250.99, q: "bluetooth-speaker" },
  { name: "iPhone 12 Pro Max 18GB RAM", category: "Phone", price: 890.0, q: "iphone-purple" },
  { name: "Headphone Ultra Thin High Volume", category: "Electronics", price: 205.9, q: "black-headphones" },
  { name: "Urban Chill T-Shirt Red", category: "Clothing", price: 35.0, q: "red-tshirt" },
  { name: "Urban Chill Striped T-Shirt", category: "Clothing", price: 45.0, q: "striped-tshirt" },
  { name: "Urban Chill Denim Jacket", category: "Clothing", price: 67.9, q: "denim-jacket" },
  { name: "Urban Chill Hoodie Red", category: "Clothing", price: 50.0, q: "red-hoodie" },
  { name: "Urban Chill Sweater Lilac", category: "Clothing", price: 25.9, q: "lilac-sweater" },
  { name: "Khartolivia Leather Belt", category: "Accessories", price: 67.8, q: "leather-belt-gold" },
  { name: "Bottega Veneta Bag", category: "Accessories", price: 25.8, q: "brown-handbag" },
  { name: "Celine Eyewear Sunglasses", category: "Accessories", price: 45.0, q: "tortoise-sunglasses" },
  { name: "Urban Denim Jeans Cap", category: "Accessories", price: 50.0, q: "denim-cap" },
  { name: "Core Carry Bag", category: "Accessories", price: 35.0, q: "wicker-basket-bag" },
  { name: "Classic Leather Wallet", category: "Accessories", price: 49.0, q: "leather-wallet" },
  { name: "Wireless Earbuds Pro", category: "Electronics", price: 129.0, q: "wireless-earbuds" },
];


function makeImage(seed: string, idx: number) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed + "-" + idx)}/600/600`;
}

export const products: Product[] = Array.from({ length: 96 }, (_, i) => {
  const s = seeds[i % seeds.length];
  const variant = Math.floor(i / seeds.length);
  const oldPrice = i % 3 === 0 ? Math.round(s.price * 1.3 * 100) / 100 : undefined;
  return {
    id: `p-${i + 1}`,
    name: variant > 0 ? `${s.name} ${variant + 1}` : s.name,
    category: s.category,
    price: s.price,
    oldPrice,
    rating: 4 + ((i * 7) % 10) / 10,
    reviews: 20 + ((i * 13) % 200),
    image: makeImage(s.q, i),
    badge: i % 7 === 0 ? "SALE" : i % 11 === 0 ? "NEW" : undefined,
  };
});

export const categories = [
  { name: "Clothing", icon: "👕", color: "var(--lavender)" },
  { name: "Accessories", icon: "👜", color: "var(--blush)" },
  { name: "Phone", icon: "📱", color: "var(--mint)" },
  { name: "Computers", icon: "💻", color: "var(--sky-soft)" },
  { name: "Cosmetics", icon: "💄", color: "var(--blush)" },
  { name: "Electronics", icon: "🎧", color: "var(--sand)" },
  { name: "Sneakers", icon: "👟", color: "var(--lavender)" },
  { name: "Bags", icon: "🛍️", color: "var(--mint)" },
];

export function formatPrice(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
