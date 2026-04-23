/* ═══════════════════════════════════════════════════════════
   KATSINA CRAFTS — APP.JS
   React application with hash-based routing
   Views: Storefront (#/) · Product Detail · Vendor Dashboard (#/dashboard)
   ═══════════════════════════════════════════════════════════ */

const { useState, useEffect, useRef, useCallback } = React;


/* ─────────────────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────────────────── */

const PRODUCTS_INIT = [
  { id:1, name:"Katsina Rattan Armchair", price:185000, category:"Chairs", artisan:"Malam Sani Crafts", description:"Hand-woven rattan back with solid wood frame. Inspired by traditional Hausa sitting rooms, this armchair blends comfort with heritage craftsmanship. Solid mahogany legs with oil finish.", img:"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80", rating:4.8, reviews:24, featured:true, tag:"Best Seller" },
  { id:2, name:"Daura Lounge Chair", price:142000, category:"Chairs", artisan:"Abdullahi Woodworks", description:"Scandinavian-meets-Sahel design. Cane-backed barrel chair with cushioned seat, perfect for modern Nigerian living spaces. Available in ash or walnut.", img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", rating:4.6, reviews:18, featured:true, tag:"New Arrival" },
  { id:3, name:"Funtua Round Coffee Table", price:225000, category:"Tables", artisan:"Katsina Heritage Furniture", description:"Statement round coffee table with rattan-wrapped drum base and rich walnut top. Features hidden storage shelf — traditional form meets modern function.", img:"https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&q=80", rating:4.9, reviews:31, featured:true, tag:"Editor's Pick" },
  { id:4, name:"Durbar Sculptural Table", price:198000, category:"Tables", artisan:"Malam Sani Crafts", description:"Sculptural walnut coffee table inspired by the flowing forms of Katsina Durbar festival drums. Three-legged organic base with smooth elliptical top.", img:"https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600&q=80", rating:4.7, reviews:15, featured:false, tag:null },
  { id:5, name:"Zango Woven Side Table", price:67000, category:"Tables", artisan:"Amina's Rattan Studio", description:"Compact side table featuring hand-woven rattan top on tapered mahogany legs. Perfect accent piece inspired by Katsina market baskets.", img:null, rating:4.5, reviews:9, featured:false, tag:null },
  { id:6, name:"Barkiya Rattan Shelf", price:156000, category:"Storage", artisan:"Abdullahi Woodworks", description:"Open shelving unit with rattan panel doors and solid wood frame. Three tiers of display with two concealed compartments below.", img:null, rating:4.4, reviews:12, featured:false, tag:null },
  { id:7, name:"Kusada Floor Lamp", price:89000, category:"Lighting", artisan:"Amina's Rattan Studio", description:"Tall standing lamp with rattan-woven shade casting warm, patterned light. Iron base with brass finish. A modern tribute to traditional Katsina lanterns.", img:null, rating:4.3, reviews:7, featured:false, tag:null },
  { id:8, name:"Malumfashi Dining Set", price:480000, category:"Tables", artisan:"Katsina Heritage Furniture", description:"Six-seater dining table with matching cane-back chairs. Solid iroko wood construction. The set that brings family together, Katsina style.", img:null, rating:4.9, reviews:5, featured:false, tag:"Premium" },
];

const CATEGORIES = ["All","Chairs","Tables","Storage","Lighting","Decor","Outdoor"];

const ARTISANS = [
  { name:"Malam Sani Crafts",        location:"Katsina City",  products:23, rating:4.8, bg:"rgba(200,145,58,0.12)" },
  { name:"Abdullahi Woodworks",       location:"Daura",         products:18, rating:4.6, bg:"rgba(139,69,19,0.08)"  },
  { name:"Katsina Heritage Furniture",location:"Funtua",        products:31, rating:4.9, bg:"rgba(212,162,78,0.1)"  },
  { name:"Amina's Rattan Studio",     location:"Malumfashi",    products:14, rating:4.5, bg:"rgba(107,68,35,0.08)"  },
];

const MARQUEE = ["Handwoven Rattan","Katsina Heritage","Sustainable Wood","Artisan Crafted","Made in Nigeria","Traditional Patterns","Modern Design","Cultural Pride"];

const PLACEHOLDER_ICONS = { Chairs:"🪑", Tables:"🪵", Storage:"📦", Lighting:"💡", Decor:"🏺", Outdoor:"🌿" };

const TAG_CLASSES = { "Best Seller":"product-tag--best", "New Arrival":"product-tag--new", "Editor's Pick":"product-tag--pick", "Premium":"product-tag--premium", "New":"product-tag--default" };

const fmt = n => "₦" + n.toLocaleString();


/* ─────────────────────────────────────────────────────────
   SVG ICONS
   ───────────────────────────────────────────────────────── */

const Icon = {
  Heart: ({ size=16, stroke="#8B4513" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Bag: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5B4E" strokeWidth="1.8">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C75050" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Image: () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C8913A" strokeWidth="1.4" style={{display:'block',margin:'0 auto 8px'}}>
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Check: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Truck: () => (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D4C4B0" strokeWidth="1.3" style={{display:'block',margin:'0 auto 14px'}}>
      <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D2B1F" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D2B1F" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Back: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
};


/* ─────────────────────────────────────────────────────────
   SMALL COMPONENTS
   ───────────────────────────────────────────────────────── */

function Stars({ rating, size = 14 }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? "#C8913A" : "#E0D5C4"}>
          <polygon points="10,1.5 12.5,7 18.5,7.5 14,11.5 15.5,17.5 10,14 4.5,17.5 6,11.5 1.5,7.5 7.5,7"/>
        </svg>
      ))}
      <span className="stars-num">{rating}</span>
    </span>
  );
}


/* ─────────────────────────────────────────────────────────
   HASH ROUTER (lightweight)
   ───────────────────────────────────────────────────────── */

function useHashRouter() {
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((hash) => {
    window.location.hash = hash;
  }, []);

  return { route, navigate };
}


/* ─────────────────────────────────────────────────────────
   NAVIGATION
   ───────────────────────────────────────────────────────── */

function Navbar({ route, navigate, cartCount }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const isDashboard = route.startsWith('#/dashboard');
  const linkClass = (hash) => `nav-link${route === hash ? ' active' : ''}`;

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#/" className="nav-logo" onClick={() => navigate('#/')}>
          <div className="nav-logo-icon">K</div>
          <span className="nav-logo-text">Katsina<em>Crafts</em></span>
        </a>

        <div className="nav-links">
          <a href="#/" className={linkClass('#/')} onClick={() => { navigate('#/'); setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({behavior:'smooth'}), 100); }}>Shop</a>
          <a href="#/" className={linkClass('#/artisans')}>Artisans</a>
          <a href="#/" className={linkClass('#/heritage')}>Heritage</a>
          <a href="#" className="nav-link">About</a>
          <button className="btn btn-primary" onClick={() => navigate('#/dashboard')}>
            {isDashboard ? 'Back to Shop' : 'Sell on Katsina'}
          </button>
          <span className="cart-icon" onClick={() => navigate('#/')}>
            <Icon.Bag />
            <span className="cart-badge">{cartCount}</span>
          </span>
        </div>

        <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <Icon.Close /> : <Icon.Menu />}
        </button>
      </div>
    </nav>
  );
}


/* ─────────────────────────────────────────────────────────
   PRODUCT CARD
   ───────────────────────────────────────────────────────── */

function ProductCard({ product, onClick, onAddCart, delay = 0 }) {
  const [imgOk, setImgOk] = useState(true);
  const tagCls = product.tag ? (TAG_CLASSES[product.tag] || 'product-tag--default') : null;

  return (
    <div className="product-card anim-fade-up" style={{ animationDelay: delay + 's' }} onClick={() => onClick(product)}>
      <div className="product-img-wrap">
        {product.img && imgOk ? (
          <img className="product-img" src={product.img} alt={product.name} loading="lazy" onError={() => setImgOk(false)} />
        ) : (
          <div className="product-placeholder">
            <span className="product-placeholder-icon">{PLACEHOLDER_ICONS[product.category] || '🏠'}</span>
            <span className="product-placeholder-label">Coming Soon</span>
          </div>
        )}
        {tagCls && <span className={`product-tag ${tagCls}`}>{product.tag}</span>}
        <button className="product-heart" onClick={e => { e.stopPropagation(); }}><Icon.Heart /></button>
      </div>
      <div className="product-info">
        <p className="product-artisan">{product.artisan}</p>
        <h3 className="product-name">{product.name}</h3>
        <Stars rating={product.rating} size={12} />
        <div className="product-bottom">
          <span className="product-price">{fmt(product.price)}</span>
          <button className="btn-cart-sm" onClick={e => { e.stopPropagation(); onAddCart(product); }}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   PRODUCT MODAL
   ───────────────────────────────────────────────────────── */

function ProductModal({ product, onClose, onAddCart }) {
  if (!product) return null;

  // Close on ESC
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box pm" onClick={e => e.stopPropagation()}>
        <div className="pm-body">
          <div className="pm-img-side">
            {product.img
              ? <img src={product.img} alt={product.name} />
              : <div className="pm-img-empty">🏠</div>
            }
          </div>
          <div className="pm-details">
            <button className="modal-close" onClick={onClose} style={{position:'absolute',top:16,right:16,zIndex:10}}>×</button>
            <p className="pm-artisan">{product.artisan}</p>
            <h2 className="pm-name">{product.name}</h2>
            <span><Stars rating={product.rating} /><span className="pm-reviews">({product.reviews} reviews)</span></span>
            <p className="pm-price">{fmt(product.price)}</p>
            <p className="pm-desc">{product.description}</p>
            <div className="pm-tags">
              <span className="pm-tag">{product.category}</span>
              <span className="pm-tag">Handcrafted</span>
              <span className="pm-tag">Made in Katsina</span>
            </div>
            <div className="pm-actions">
              <button className="pm-btn-cart" onClick={() => { onAddCart(product); onClose(); }}>Add to Cart</button>
              <button className="pm-btn-wish"><Icon.Heart size={18} stroke="#C8913A" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   STOREFRONT VIEW
   ───────────────────────────────────────────────────────── */

function Storefront({ products, onSelectProduct, onAddCart, navigate }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const filtered = products
    .filter(p => activeCategory === 'All' || p.category === activeCategory)
    .filter(p => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.artisan.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'price-low')  return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating')     return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero rattan-bg">
        <div className="hero-glow" />
        <div className="hero-inner">
          <div className="hero-badge anim-fade-up">
            <span className="hero-badge-dot" />
            <span className="hero-badge-text">From the heart of Northern Nigeria</span>
          </div>
          <h1 className="anim-fade-up anim-d1">Where Katsina <em>Heritage</em> Meets Modern Living</h1>
          <p className="hero-sub anim-fade-up anim-d2">Discover handcrafted furniture and home accessories made by skilled artisans from Katsina State. Every piece tells a story of tradition, craftsmanship, and pride.</p>
          <div className="hero-actions anim-fade-up anim-d3">
            <a href="#shop-section" className="btn btn-primary btn-lg" onClick={() => setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({behavior:'smooth'}), 50)}>Explore Collection</a>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('#/dashboard')}>Become an Artisan</button>
          </div>
          <div className="hero-stats anim-fade-up anim-d4">
            {[['120+','Artisan Products'],['34','Local Artisans'],['15k+','Happy Homes']].map(([num,label]) => (
              <div key={label}>
                <p className="hero-stat-num">{num}</p>
                <p className="hero-stat-label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-bar">
        <div className="marquee-track">
          {[0,1].flatMap(j => MARQUEE.map((w,i) => (
            <span key={`${j}-${i}`} className="marquee-item"><span className="marquee-dot"/>{w}</span>
          )))}
        </div>
      </div>

      {/* ── ARTISANS ── */}
      <section id="artisans-section" className="section" style={{paddingBottom:32}}>
        <div className="section-header">
          <div>
            <p className="section-label">Meet the Makers</p>
            <h2 className="section-title">Our Artisans</h2>
          </div>
          <a href="#" className="view-all">View All <span>→</span></a>
        </div>
        <div className="artisans-grid">
          {ARTISANS.map((a, i) => (
            <div key={a.name} className="artisan-card anim-fade-up" style={{animationDelay: i*0.1+'s'}}>
              <div className="artisan-top">
                <div className="artisan-avatar" style={{background:a.bg}}>{a.name[0]}</div>
                <div>
                  <p className="artisan-name">{a.name}</p>
                  <p className="artisan-loc">{a.location}, Katsina</p>
                </div>
              </div>
              <div className="artisan-bottom">
                <span className="artisan-count">{a.products} products</span>
                <Stars rating={a.rating} size={11} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHOP ── */}
      <section id="shop-section" className="section" style={{paddingTop:48}}>
        <div className="section-header">
          <div>
            <p className="section-label">Curated Collection</p>
            <h2 className="section-title">Shop Our Pieces</h2>
          </div>
        </div>

        <div className="filters">
          <div className="search-wrap">
            <span className="search-icon"><Icon.Search /></span>
            <input className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search furniture, artisans..." />
          </div>
          <div className="cat-pills">
            {CATEGORIES.map(c => (
              <button key={c} className={`cat-pill${activeCategory === c ? ' active' : ''}`} onClick={() => setActiveCategory(c)}>{c}</button>
            ))}
          </div>
          <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <p className="results-count">{filtered.length} piece{filtered.length !== 1 ? 's' : ''} found</p>

        {filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} onClick={onSelectProduct} onAddCart={onAddCart} delay={i * 0.06} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-state-icon">🔍</p>
            <p className="empty-state-title">No pieces found</p>
            <p className="empty-state-sub">Try adjusting your search or filters</p>
          </div>
        )}
      </section>

      {/* ── HERITAGE ── */}
      <section id="heritage-section" className="heritage">
        <div className="heritage-inner">
          <p className="section-label">Our Heritage</p>
          <h2 className="section-title">Preserving the <em>Rich Craft</em> of Katsina State</h2>
          <p className="heritage-sub">From the ancient city walls of Katsina to the vibrant Durbar festivals, our artisans draw from centuries of creative tradition. Every weave, every joint, every curve carries the spirit of Northern Nigerian craftsmanship.</p>
          <div className="heritage-grid">
            {[
              ['🌿','Sustainably Sourced','Local woods and rattan harvested responsibly from Katsina forests and surrounding regions.'],
              ['🤲','Handcrafted','Every piece is made by hand using techniques passed down through generations of master craftsmen.'],
              ['🏛️','Cultural Heritage','Designs inspired by Hausa architecture, Durbar festival art, and Katsina\'s deep artistic legacy.'],
              ['🚚','Nationwide Delivery','We ship across Nigeria — from Katsina State to your doorstep, carefully packaged and insured.'],
            ].map(([icon,title,desc]) => (
              <div key={title} className="heritage-card">
                <span className="heritage-card-icon">{icon}</span>
                <h3 className="heritage-card-title">{title}</h3>
                <p className="heritage-card-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter">
        <div className="newsletter-box rattan-bg">
          <div style={{position:'relative',zIndex:1}}>
            <h2 className="newsletter-title">Stay Connected with Katsina Crafts</h2>
            <p className="newsletter-sub">Get updates on new arrivals, artisan stories, and exclusive offers from Katsina's finest craftsmen.</p>
            <div className="newsletter-form">
              <input className="newsletter-input" placeholder="Enter your email" />
              <button className="btn btn-primary btn-lg">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


/* ─────────────────────────────────────────────────────────
   VENDOR DASHBOARD VIEW
   ───────────────────────────────────────────────────────── */

function Dashboard({ products, setProducts, navigate }) {
  const [tab, setTab] = useState('products');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', price:'', category:'Chairs', artisan:'', description:'' });
  const [shopForm, setShopForm] = useState({ shopName:'', ownerName:'', location:'', phone:'', bio:'' });
  const [shopCreated, setShopCreated] = useState(false);

  const handleAddProduct = () => {
    if (!form.name || !form.price) return;
    const np = {
      id: Date.now(), name: form.name, price: parseInt(form.price),
      category: form.category, artisan: form.artisan || 'Independent Artisan',
      description: form.description, img: null,
      rating: 0, reviews: 0, featured: false, tag: 'New',
    };
    setProducts(prev => [np, ...prev]);
    setForm({ name:'', price:'', category:'Chairs', artisan:'', description:'' });
    setShowForm(false);
  };

  const handleDelete = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const handleCreateShop = () => {
    if (!shopForm.shopName || !shopForm.ownerName) return;
    setShopCreated(true);
  };

  const updateForm = (key, val) => setForm(f => ({...f, [key]: val}));
  const updateShop = (key, val) => setShopForm(f => ({...f, [key]: val}));

  const tabs = [['products','Products'],['shop','My Shop'],['orders','Orders'],['analytics','Analytics']];

  return (
    <div style={{paddingTop:76, minHeight:'100vh', background:'var(--cream)'}}>
      <div style={{maxWidth:900, margin:'0 auto', padding:'40px 36px 80px'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:8}}>
          <button onClick={() => navigate('#/')} style={{display:'flex',alignItems:'center',gap:6,color:'var(--saddle)',fontWeight:600,fontSize:14,background:'none',border:'none',cursor:'pointer',padding:0}}>
            <Icon.Back /> Back to Shop
          </button>
        </div>
        <div style={{marginBottom:32}}>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,4vw,38px)',fontWeight:600,color:'var(--earth)',letterSpacing:'-0.5px'}}>Artisan Dashboard</h1>
          <p style={{fontSize:14,color:'var(--muted)',marginTop:4}}>Manage your storefront, products, and orders</p>
        </div>

        {/* Tabs */}
        <div className="admin-tabs" style={{borderBottom:'1px solid #F0E6D8',marginBottom:0}}>
          {tabs.map(([key,label]) => (
            <button key={key} className={`admin-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        <div style={{padding:'28px 0'}}>

          {/* ── PRODUCTS TAB ── */}
          {tab === 'products' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
                <span style={{fontSize:14,color:'var(--warm-gray)'}}>{products.length} products listed</span>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Product</button>
              </div>

              {showForm && (
                <div className="new-product-form">
                  <h3>New Product</h3>
                  <div className="form-grid">
                    <div>
                      <label className="form-label">Product Name</label>
                      <input className="form-input" value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="e.g. Katsina Rattan Chair" />
                    </div>
                    <div>
                      <label className="form-label">Price (₦)</label>
                      <input className="form-input" type="number" value={form.price} onChange={e => updateForm('price', e.target.value)} placeholder="e.g. 150000" />
                    </div>
                    <div>
                      <label className="form-label">Category</label>
                      <select className="form-input form-select" value={form.category} onChange={e => updateForm('category', e.target.value)}>
                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Artisan / Shop Name</label>
                      <input className="form-input" value={form.artisan} onChange={e => updateForm('artisan', e.target.value)} placeholder="Your shop name" />
                    </div>
                    <div className="form-full">
                      <label className="form-label">Description</label>
                      <textarea className="form-input form-textarea" value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="Describe your product — materials, dimensions, inspiration..." />
                    </div>
                    <div className="form-full">
                      <label className="form-label">Product Images</label>
                      <div className="upload-zone">
                        <Icon.Image />
                        <p>Click to upload or drag and drop</p>
                        <p className="hint">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:12,marginTop:22,justifyContent:'flex-end'}}>
                    <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                    <button className="btn btn-rattan" onClick={handleAddProduct}>Publish Product</button>
                  </div>
                </div>
              )}

              <div>
                {products.map(p => (
                  <div key={p.id} className="p-row">
                    <div className="p-row-thumb">
                      {p.img ? <img src={p.img} alt="" /> : <span style={{fontSize:20,opacity:0.22}}>🪑</span>}
                    </div>
                    <div className="p-row-info">
                      <p className="p-row-name">{p.name}</p>
                      <p className="p-row-meta">{p.category} · {p.artisan}</p>
                    </div>
                    <span className="p-row-price">{fmt(p.price)}</span>
                    <div className="p-row-actions">
                      <button className="icon-btn"><Icon.Edit /></button>
                      <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(p.id)}><Icon.Trash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── SHOP TAB ── */}
          {tab === 'shop' && !shopCreated && (
            <div>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:600,marginBottom:8,color:'var(--earth)'}}>Create Your Storefront</h3>
              <p style={{fontSize:14,color:'var(--warm-gray)',lineHeight:1.65,marginBottom:26}}>Set up your artisan shop and start selling your handcrafted furniture to customers across Nigeria.</p>
              <div className="form-grid">
                <div>
                  <label className="form-label">Shop Name</label>
                  <input className="form-input" value={shopForm.shopName} onChange={e => updateShop('shopName', e.target.value)} placeholder="e.g. Sani's Rattan Creations" />
                </div>
                <div>
                  <label className="form-label">Owner's Name</label>
                  <input className="form-input" value={shopForm.ownerName} onChange={e => updateShop('ownerName', e.target.value)} placeholder="Your full name" />
                </div>
                <div>
                  <label className="form-label">Location in Katsina</label>
                  <input className="form-input" value={shopForm.location} onChange={e => updateShop('location', e.target.value)} placeholder="e.g. Katsina City, Daura, Funtua" />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={shopForm.phone} onChange={e => updateShop('phone', e.target.value)} placeholder="+234..." />
                </div>
                <div className="form-full">
                  <label className="form-label">Shop Bio</label>
                  <textarea className="form-input form-textarea" value={shopForm.bio} onChange={e => updateShop('bio', e.target.value)} placeholder="Tell your story — your craft, your inspiration, your heritage..." />
                </div>
                <div className="form-full">
                  <label className="form-label">Shop Logo / Banner</label>
                  <div className="upload-zone">
                    <Icon.Image />
                    <p>Upload your shop logo or banner image</p>
                    <p className="hint">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary btn-lg btn-full" style={{marginTop:22}} onClick={handleCreateShop}>Create My Shop</button>
            </div>
          )}
          {tab === 'shop' && shopCreated && (
            <div className="panel-success">
              <div className="panel-success-check"><Icon.Check /></div>
              <h3>Shop Created!</h3>
              <p>"{shopForm.shopName}" is now live. Head to the Products tab to start adding your pieces.</p>
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {tab === 'orders' && (
            <div className="panel-empty">
              <Icon.Truck />
              <p>No orders yet</p>
              <p>Orders will appear here once customers start purchasing your products</p>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === 'analytics' && (
            <div className="stat-grid">
              {[['Views','1,247','+12%'],['Products Listed',String(products.length),''],['Enquiries','34','+8%'],['Revenue','₦0','']].map(([label,value,change]) => (
                <div key={label} className="stat-card">
                  <p className="stat-label">{label}</p>
                  <p className="stat-value">{value}</p>
                  {change && <p className="stat-change">{change} this week</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <a href="#/" className="nav-logo">
              <div className="nav-logo-icon" style={{width:36,height:36,fontSize:18}}>K</div>
              <span className="nav-logo-text" style={{fontSize:20}}>Katsina<em>Crafts</em></span>
            </a>
            <p className="footer-brand-desc">Celebrating Katsina's rich heritage through handcrafted furniture and home accessories. Every piece tells a story of tradition and pride.</p>
          </div>
          <div>
            <h4 className="footer-col-title">Shop</h4>
            {['All Products','Chairs','Tables','Storage','Lighting','New Arrivals'].map(l => <a key={l} href="#/" className="footer-link">{l}</a>)}
          </div>
          <div>
            <h4 className="footer-col-title">Artisans</h4>
            {['Join as Artisan','Artisan Directory','Success Stories','Artisan FAQ'].map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
          </div>
          <div>
            <h4 className="footer-col-title">Help</h4>
            {['Contact Us','Shipping Info','Returns Policy','Size Guide','Track Order'].map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 Katsina Crafts. Made with pride in Katsina State, Nigeria.</p>
          <div className="footer-socials">
            {['Instagram','Twitter','WhatsApp'].map(s => <a key={s} href="#" className="footer-social">{s}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}


/* ─────────────────────────────────────────────────────────
   APP ROOT
   ───────────────────────────────────────────────────────── */

function App() {
  const { route, navigate } = useHashRouter();
  const [products, setProducts] = useState(PRODUCTS_INIT);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const handleAddCart = (product) => {
    setCartCount(c => c + 1);
  };

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  // Determine view
  const isDashboard = route.startsWith('#/dashboard');

  return (
    <>
      <Navbar route={route} navigate={navigate} cartCount={cartCount} />

      {isDashboard ? (
        <Dashboard products={products} setProducts={setProducts} navigate={navigate} />
      ) : (
        <Storefront products={products} onSelectProduct={setSelectedProduct} onAddCart={handleAddCart} navigate={navigate} />
      )}

      <Footer />

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddCart={handleAddCart} />
      )}
    </>
  );
}


/* ─── MOUNT ────────────────────────────────────────────── */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
