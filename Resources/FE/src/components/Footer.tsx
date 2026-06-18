export function Footer() {
  const links = ["New Arrival", "Most Pick", "Sale", "Women", "Men", "Sneakers", "Store Location", "Contact Us"];
  return (
    <footer className="mt-24">
      <div className="bg-secondary">
        <div className="container-page py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">SUBSCRIBE OUR<br />NEWSLETTER</h2>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">Discover quality offerings, blog stories, and weekly drops curated for your style.</p>
            <form className="flex gap-2 bg-background rounded-full p-1.5 shadow-[var(--shadow-soft)]">
              <input placeholder="Your email address" className="flex-1 px-4 bg-transparent outline-none text-sm" />
              <button className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium">Check it now</button>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-primary text-primary-foreground">
        <div className="container-page py-8 flex flex-wrap gap-x-8 gap-y-3 justify-center text-xs tracking-wider">
          {links.map((l) => <a key={l} href="#" className="opacity-80 hover:opacity-100">{l.toUpperCase()}</a>)}
        </div>
        <div className="container-page pb-8">
          <h1 className="font-display text-[18vw] md:text-[14vw] leading-none font-black text-center tracking-tighter">SMART SHOP</h1>
        </div>
      </div>
    </footer>
  );
}
