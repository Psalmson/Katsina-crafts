/* ═══════════════════════════════════════════════════════════
   KATSINA CRAFTS — APP.JS
   Full Supabase integration: Auth, Artisan approval,
   Product CRUD with image upload, Admin management
   ═══════════════════════════════════════════════════════════ */

const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;


/* ─────────────────────────────────────────────────────────
   SUPABASE CLIENT
   ───────────────────────────────────────────────────────── */

const SUPABASE_URL = 'https://tngqzkbgppfcshovdbmu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ3F6a2JncHBmY3Nob3ZkYm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjY1MzgsImV4cCI6MjA5MjgwMjUzOH0.IwI7BknqYyt1kQ0Vj1smCFJDavVFwBMVc1tuAXxmMi8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


/* ─────────────────────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────────────────────── */

const CATEGORIES_STATIC = ['All','Chairs','Tables','Storage','Lighting','Decor','Outdoor'];
const MARQUEE = ['Handwoven Rattan','Katsina Heritage','Sustainable Wood','Artisan Crafted','Made in Nigeria','Traditional Patterns','Modern Design','Cultural Pride'];
const PLACEHOLDER_ICONS = { Chairs:'🪑', Tables:'🪵', Storage:'📦', Lighting:'💡', Decor:'🏺', Outdoor:'🌿' };
const TAG_CLASSES = { 'Best Seller':'product-tag--best', 'New Arrival':'product-tag--new', "Editor's Pick":'product-tag--pick', 'Premium':'product-tag--premium', 'New':'product-tag--default' };
const fmt = n => '₦' + Number(n).toLocaleString();


/* ─────────────────────────────────────────────────────────
   CONTEXT — AUTH & TOAST
   ───────────────────────────────────────────────────────── */

const AuthContext = createContext(null);
const ToastContext = createContext(null);

function useAuth() { return useContext(AuthContext); }
function useToast() { return useContext(ToastContext); }


/* ─────────────────────────────────────────────────────────
   TOAST SYSTEM
   ───────────────────────────────────────────────────────── */

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


/* ─────────────────────────────────────────────────────────
   AUTH PROVIDER
   ───────────────────────────────────────────────────────── */

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    return data;
  };

  const fetchArtisan = async (userId) => {
    const { data } = await supabase
      .from('artisans')
      .select('*')
      .eq('profile_id', userId)
      .single();
    setArtisan(data);
    return data;
  };

  const refreshAuth = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    if (u) {
      await fetchProfile(u.id);
      await fetchArtisan(u.id);
    } else {
      setProfile(null);
      setArtisan(null);
    }
  };

  useEffect(() => {
    refreshAuth().finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        // Small delay to allow trigger to create profile
        setTimeout(async () => {
          await fetchProfile(session.user.id);
          await fetchArtisan(session.user.id);
        }, 500);
      } else {
        setProfile(null);
        setArtisan(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setArtisan(null);
  };

  const value = { user, profile, artisan, loading, signOut, refreshAuth, fetchArtisan };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


/* ─────────────────────────────────────────────────────────
   SVG ICONS
   ───────────────────────────────────────────────────────── */

const Icon = {
  Heart: ({ size=16, stroke='#8B4513' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bag: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5B4E" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C75050" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  ImageIcon: () => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C8913A" strokeWidth="1.4" style={{display:'block',margin:'0 auto 8px'}}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Check: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Truck: () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D4C4B0" strokeWidth="1.3" style={{display:'block',margin:'0 auto 14px'}}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Shield: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D2B1F" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
};


/* ─────────────────────────────────────────────────────────
   STARS COMPONENT
   ───────────────────────────────────────────────────────── */

function Stars({ rating, size = 14 }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#C8913A' : '#E0D5C4'}>
          <polygon points="10,1.5 12.5,7 18.5,7.5 14,11.5 15.5,17.5 10,14 4.5,17.5 6,11.5 1.5,7.5 7.5,7"/>
        </svg>
      ))}
      <span className="stars-num">{Number(rating).toFixed(1)}</span>
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`badge badge--${status}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}


/* ─────────────────────────────────────────────────────────
   HASH ROUTER
   ───────────────────────────────────────────────────────── */

function useHashRouter() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  useEffect(() => {
    const h = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  const navigate = useCallback(hash => { window.location.hash = hash; }, []);
  return { route, navigate };
}


/* ─────────────────────────────────────────────────────────
   AUTH MODAL
   ───────────────────────────────────────────────────────── */

function AuthModal({ onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast('Welcome back!', 'success');
        onClose();
      } else {
        if (!fullName.trim()) { setError('Please enter your full name'); setLoading(false); return; }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } }
        });
        if (error) throw error;
        toast('Account created! Check your email to confirm.', 'success');
        onClose();
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-inner">
          <button className="modal-close" onClick={onClose} style={{position:'absolute',top:16,right:16}}>×</button>

          <div className="auth-header">
            <div className="nav-logo" style={{justifyContent:'center',marginBottom:16}}>
              <div className="nav-logo-icon">K</div>
            </div>
            <h2 className="auth-title">{mode === 'login' ? 'Welcome Back' : 'Join Katsina Crafts'}</h2>
            <p className="auth-subtitle">{mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {mode === 'signup' && (
            <>
              <div className="auth-role-select">
                <button className={`auth-role-btn${role === 'buyer' ? ' active' : ''}`} onClick={() => setRole('buyer')}>
                  🛒 Buyer
                  <small>Browse & purchase</small>
                </button>
                <button className={`auth-role-btn${role === 'artisan' ? ' active' : ''}`} onClick={() => setRole('artisan')}>
                  🤲 Artisan
                  <small>Sell your crafts</small>
                </button>
              </div>
              <div style={{marginBottom:16}}>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
              </div>
            </>
          )}

          <div style={{marginBottom:16}}>
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div style={{marginBottom:24}}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'} />
          </div>

          <button className="btn btn-primary btn-lg btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="auth-toggle">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   USER MENU (dropdown)
   ───────────────────────────────────────────────────────── */

function UserMenu({ navigate }) {
  const { user, profile, artisan, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!user) return null;

  const initials = (profile?.full_name || user.email || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const isAdmin = profile?.role === 'admin';
  const isArtisan = profile?.role === 'artisan';

  return (
    <div className="user-menu-wrap" ref={ref}>
      <button className="user-avatar-btn" onClick={() => setOpen(!open)}>{initials}</button>
      {open && (
        <div className="user-dropdown">
          <div style={{padding:'10px 14px 8px',borderBottom:'1px solid var(--border)'}}>
            <p style={{fontSize:13,fontWeight:600,color:'var(--earth)'}}>{profile?.full_name || 'User'}</p>
            <p style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{user.email}</p>
            {profile?.role && <StatusBadge status={profile.role} />}
          </div>

          {isArtisan && (
            <button className="user-dropdown-item" onClick={() => { navigate('#/dashboard'); setOpen(false); }}>
              <Icon.User /> My Dashboard
            </button>
          )}
          {isAdmin && (
            <button className="user-dropdown-item" onClick={() => { navigate('#/admin'); setOpen(false); }}>
              <Icon.Shield /> Admin Panel
            </button>
          )}
          <div className="user-dropdown-divider" />
          <button className="user-dropdown-item user-dropdown-item--danger" onClick={() => { signOut(); setOpen(false); }}>
            <Icon.LogOut /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   NAVBAR
   ───────────────────────────────────────────────────────── */

function Navbar({ route, navigate, cartCount, onAuthClick }) {
  const { user, profile } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#/" className="nav-logo">
          <div className="nav-logo-icon">K</div>
          <span className="nav-logo-text">Katsina<em>Crafts</em></span>
        </a>
        <div className="nav-links">
          <a href="#/" className="nav-link">Shop</a>
          <a href="#" className="nav-link">Artisans</a>
          <a href="#" className="nav-link">Heritage</a>

          {!user ? (
            <>
              <button className="btn btn-outline" onClick={() => onAuthClick('login')}>Sign In</button>
              <button className="btn btn-primary" onClick={() => onAuthClick('signup')}>Get Started</button>
            </>
          ) : (
            <>
              {profile?.role === 'artisan' && (
                <button className="btn btn-primary" onClick={() => navigate('#/dashboard')}>Dashboard</button>
              )}
              {profile?.role === 'admin' && (
                <button className="btn btn-primary" onClick={() => navigate('#/admin')}>Admin</button>
              )}
              <UserMenu navigate={navigate} />
            </>
          )}

          <span className="cart-icon">
            <Icon.Bag />
            <span className="cart-badge">{cartCount}</span>
          </span>
        </div>
      </div>
    </nav>
  );
}


/* ─────────────────────────────────────────────────────────
   PRODUCT CARD
   ───────────────────────────────────────────────────────── */

function ProductCard({ product, onClick, onAddCart, delay = 0 }) {
  const [imgOk, setImgOk] = useState(true);
  const imgUrl = product.primary_image_url || product.img;
  const catName = product.category_name || product.category;
  const artName = product.artisan_name || product.artisan;
  const tagCls = product.tag ? (TAG_CLASSES[product.tag] || 'product-tag--default') : null;

  return (
    <div className="product-card anim-fade-up" style={{animationDelay: delay+'s'}} onClick={() => onClick(product)}>
      <div className="product-img-wrap">
        {imgUrl && imgOk ? (
          <img className="product-img" src={imgUrl} alt={product.name} loading="lazy" onError={() => setImgOk(false)} />
        ) : (
          <div className="product-placeholder">
            <span className="product-placeholder-icon">{PLACEHOLDER_ICONS[catName] || '🏠'}</span>
            <span className="product-placeholder-label">Coming Soon</span>
          </div>
        )}
        {tagCls && <span className={`product-tag ${tagCls}`}>{product.tag}</span>}
        {product.is_featured && !product.tag && <span className="product-tag product-tag--pick">Featured</span>}
        <button className="product-heart" onClick={e => e.stopPropagation()}><Icon.Heart /></button>
      </div>
      <div className="product-info">
        <p className="product-artisan">{artName}</p>
        <h3 className="product-name">{product.name}</h3>
        <Stars rating={product.rating || 0} size={12} />
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
  const imgUrl = product.primary_image_url || product.img;
  const catName = product.category_name || product.category;
  const artName = product.artisan_name || product.artisan;

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
            {imgUrl ? <img src={imgUrl} alt={product.name} /> : <div className="pm-img-empty">🏠</div>}
          </div>
          <div className="pm-details">
            <button className="modal-close" onClick={onClose} style={{position:'absolute',top:16,right:16,zIndex:10}}>×</button>
            <p className="pm-artisan">{artName}</p>
            <h2 className="pm-name">{product.name}</h2>
            <span><Stars rating={product.rating || 0} /><span className="pm-reviews">({product.review_count || 0} reviews)</span></span>
            <p className="pm-price">{fmt(product.price)}</p>
            <p className="pm-desc">{product.description}</p>
            <div className="pm-tags">
              <span className="pm-tag">{catName}</span>
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

function Storefront({ navigate, onSelectProduct, onAddCart, onAuthClick }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Fetch approved products with artisan + category info
    const { data: prods } = await supabase
      .from('products_full')
      .select('*')
      .eq('status', 'approved');

    // Fetch categories
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');

    // Fetch approved artisans
    const { data: arts } = await supabase
      .from('artisans')
      .select('*, profiles(full_name)')
      .eq('status', 'approved');

    setProducts(prods || []);
    setCategories(cats || []);
    setArtisans(arts || []);
    setLoading(false);
  };

  const catNames = ['All', ...(categories.map(c => c.name))];

  const filtered = products
    .filter(p => activeCategory === 'All' || p.category_name === activeCategory)
    .filter(p => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.artisan_name || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });

  return (
    <>
      {/* HERO */}
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
            <button className="btn btn-outline btn-lg" onClick={() => onAuthClick('signup')}>Become an Artisan</button>
          </div>
          <div className="hero-stats anim-fade-up anim-d4">
            {[[(products.length || '0')+'+','Artisan Products'],[(artisans.length || '0'),'Local Artisans'],['15k+','Happy Homes']].map(([num,label]) => (
              <div key={label}><p className="hero-stat-num">{num}</p><p className="hero-stat-label">{label}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-bar">
        <div className="marquee-track">
          {[0,1].flatMap(j => MARQUEE.map((w,i) => (
            <span key={`${j}-${i}`} className="marquee-item"><span className="marquee-dot"/>{w}</span>
          )))}
        </div>
      </div>

      {/* ARTISANS */}
      {artisans.length > 0 && (
        <section className="section" style={{paddingBottom:32}}>
          <div className="section-header">
            <div><p className="section-label">Meet the Makers</p><h2 className="section-title">Our Artisans</h2></div>
            <a href="#" className="view-all">View All <span>→</span></a>
          </div>
          <div className="artisans-grid">
            {artisans.map((a, i) => (
              <div key={a.id} className="artisan-card anim-fade-up" style={{animationDelay: i*0.1+'s'}}>
                <div className="artisan-top">
                  <div className="artisan-avatar" style={{background:'rgba(200,145,58,0.12)'}}>{a.shop_name[0]}</div>
                  <div>
                    <p className="artisan-name">{a.shop_name}</p>
                    <p className="artisan-loc">{a.location}, Katsina</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SHOP */}
      <section id="shop-section" className="section" style={{paddingTop:48}}>
        <div className="section-header">
          <div><p className="section-label">Curated Collection</p><h2 className="section-title">Shop Our Pieces</h2></div>
        </div>

        <div className="filters">
          <div className="search-wrap">
            <span className="search-icon"><Icon.Search /></span>
            <input className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search furniture, artisans..." />
          </div>
          <div className="cat-pills">
            {catNames.map(c => (
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

        {loading ? (
          <div className="loading-overlay"><div className="spinner" /><p className="loading-text">Loading products...</p></div>
        ) : filtered.length > 0 ? (
          <>
            <p className="results-count">{filtered.length} piece{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="products-grid">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} onClick={onSelectProduct} onAddCart={onAddCart} delay={i * 0.06} />)}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p className="empty-state-icon">🔍</p>
            <p className="empty-state-title">{products.length === 0 ? 'No products yet' : 'No pieces found'}</p>
            <p className="empty-state-sub">{products.length === 0 ? 'Check back soon — artisans are adding new pieces!' : 'Try adjusting your search or filters'}</p>
          </div>
        )}
      </section>

      {/* HERITAGE */}
      <section className="heritage">
        <div className="heritage-inner">
          <p className="section-label">Our Heritage</p>
          <h2 className="section-title">Preserving the <em>Rich Craft</em> of Katsina State</h2>
          <p className="heritage-sub">From the ancient city walls of Katsina to the vibrant Durbar festivals, our artisans draw from centuries of creative tradition.</p>
          <div className="heritage-grid">
            {[['🌿','Sustainably Sourced','Local woods and rattan harvested responsibly from Katsina forests.'],['🤲','Handcrafted','Every piece is made by hand using techniques passed down through generations.'],['🏛️','Cultural Heritage','Designs inspired by Hausa architecture and Katsina\'s deep artistic legacy.'],['🚚','Nationwide Delivery','We ship across Nigeria — from Katsina to your doorstep.']].map(([icon,title,desc]) => (
              <div key={title} className="heritage-card"><span className="heritage-card-icon">{icon}</span><h3 className="heritage-card-title">{title}</h3><p className="heritage-card-desc">{desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <div className="newsletter-box rattan-bg">
          <div style={{position:'relative',zIndex:1}}>
            <h2 className="newsletter-title">Stay Connected with Katsina Crafts</h2>
            <p className="newsletter-sub">Get updates on new arrivals, artisan stories, and exclusive offers.</p>
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
   ARTISAN DASHBOARD
   ───────────────────────────────────────────────────────── */

function Dashboard({ navigate }) {
  const { user, profile, artisan, fetchArtisan } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shop setup form
  const [shopForm, setShopForm] = useState({ shopName:'', location:'', phone:'', bio:'' });

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({ name:'', price:'', category_id:'', description:'', stock_quantity: '1' });
  const [productImages, setProductImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadDashboard(); }, [artisan]);

  const loadDashboard = async () => {
    setLoading(true);
    const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(cats || []);
    if (cats?.length && !productForm.category_id) {
      setProductForm(f => ({...f, category_id: cats[0].id}));
    }

    if (artisan?.id) {
      const { data: prods } = await supabase
        .from('products')
        .select('*, categories(name), product_images(url, is_primary)')
        .eq('artisan_id', artisan.id)
        .order('created_at', { ascending: false });
      setProducts(prods || []);
    }
    setLoading(false);
  };

  // ── CREATE SHOP ──
  const handleCreateShop = async () => {
    if (!shopForm.shopName || !shopForm.location) { toast('Please fill in shop name and location', 'error'); return; }
    const slug = shopForm.shopName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now().toString(36);

    const { error } = await supabase.from('artisans').insert({
      profile_id: user.id,
      shop_name: shopForm.shopName,
      slug,
      location: shopForm.location,
      phone: shopForm.phone,
      bio: shopForm.bio,
      status: 'pending',
    });

    if (error) { toast(error.message, 'error'); return; }

    // Update profile role to artisan
    await supabase.from('profiles').update({ role: 'artisan' }).eq('id', user.id);
    await fetchArtisan(user.id);
    toast('Shop submitted for review! We\'ll approve it shortly.', 'success');
  };

  // ── ADD PRODUCT ──
  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) { toast('Name and price are required', 'error'); return; }
    setUploading(true);

    const slug = productForm.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now().toString(36);

    const { data: prod, error } = await supabase.from('products').insert({
      artisan_id: artisan.id,
      category_id: productForm.category_id,
      name: productForm.name,
      slug,
      description: productForm.description,
      price: parseFloat(productForm.price),
      stock_quantity: parseInt(productForm.stock_quantity) || 1,
      status: 'pending',
    }).select().single();

    if (error) { toast(error.message, 'error'); setUploading(false); return; }

    // Upload images
    for (let i = 0; i < productImages.length; i++) {
      const file = productImages[i];
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${prod.id}/${Date.now()}-${i}.${ext}`;

      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file);
      if (upErr) { console.error(upErr); continue; }

      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);

      await supabase.from('product_images').insert({
        product_id: prod.id,
        url: publicUrl,
        is_primary: i === 0,
        sort_order: i,
      });
    }

    setProductForm({ name:'', price:'', category_id: categories[0]?.id || '', description:'', stock_quantity: '1' });
    setProductImages([]);
    setShowProductForm(false);
    setUploading(false);
    await loadDashboard();
    toast('Product submitted for review!', 'success');
  };

  // ── DELETE PRODUCT ──
  const handleDeleteProduct = async (id) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(p => p.filter(x => x.id !== id));
    toast('Product deleted', 'info');
  };

  const tabs = [['products','Products'],['shop','My Shop'],['orders','Orders']];

  // ── No artisan profile yet → show setup ──
  if (!artisan) {
    return (
      <div style={{paddingTop:76, minHeight:'100vh', background:'var(--cream)'}}>
        <div style={{maxWidth:600, margin:'0 auto', padding:'60px 36px 80px'}}>
          <button onClick={() => navigate('#/')} style={{display:'flex',alignItems:'center',gap:6,color:'var(--saddle)',fontWeight:600,fontSize:14,background:'none',border:'none',cursor:'pointer',padding:0,marginBottom:24}}>
            <Icon.Back /> Back to Shop
          </button>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:32,fontWeight:600,color:'var(--earth)',marginBottom:8}}>Create Your Storefront</h1>
          <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.65,marginBottom:32}}>Set up your artisan shop to start selling handcrafted furniture to customers across Nigeria. Your shop will be reviewed before going live.</p>

          <div className="form-grid">
            <div><label className="form-label">Shop Name</label><input className="form-input" value={shopForm.shopName} onChange={e => setShopForm({...shopForm, shopName:e.target.value})} placeholder="e.g. Sani's Rattan Creations" /></div>
            <div><label className="form-label">Location</label><input className="form-input" value={shopForm.location} onChange={e => setShopForm({...shopForm, location:e.target.value})} placeholder="e.g. Katsina City" /></div>
            <div><label className="form-label">Phone</label><input className="form-input" value={shopForm.phone} onChange={e => setShopForm({...shopForm, phone:e.target.value})} placeholder="+234..." /></div>
            <div className="form-full"><label className="form-label">Bio</label><textarea className="form-input form-textarea" value={shopForm.bio} onChange={e => setShopForm({...shopForm, bio:e.target.value})} placeholder="Tell your story..." /></div>
          </div>
          <button className="btn btn-primary btn-lg btn-full" style={{marginTop:24}} onClick={handleCreateShop}>Submit for Review</button>
        </div>
      </div>
    );
  }

  // ── Pending approval ──
  if (artisan.status === 'pending') {
    return (
      <div style={{paddingTop:76, minHeight:'100vh', background:'var(--cream)'}}>
        <div style={{maxWidth:500, margin:'0 auto', padding:'100px 36px', textAlign:'center'}}>
          <div style={{fontSize:56,marginBottom:16}}>⏳</div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:600,color:'var(--earth)',marginBottom:12}}>Shop Under Review</h2>
          <p style={{fontSize:15,color:'var(--warm-gray)',lineHeight:1.7}}>Your shop "{artisan.shop_name}" is being reviewed by our team. You'll be notified once approved and can then start adding products.</p>
          <StatusBadge status="pending" />
          <button className="btn btn-outline" style={{marginTop:32}} onClick={() => navigate('#/')}>Back to Shop</button>
        </div>
      </div>
    );
  }

  // ── Rejected ──
  if (artisan.status === 'rejected') {
    return (
      <div style={{paddingTop:76, minHeight:'100vh', background:'var(--cream)'}}>
        <div style={{maxWidth:500, margin:'0 auto', padding:'100px 36px', textAlign:'center'}}>
          <div style={{fontSize:56,marginBottom:16}}>😔</div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:600,color:'var(--earth)',marginBottom:12}}>Application Not Approved</h2>
          <p style={{fontSize:15,color:'var(--warm-gray)',lineHeight:1.7}}>{artisan.admin_note || 'Your shop application was not approved at this time. Please contact us for more details.'}</p>
          <button className="btn btn-outline" style={{marginTop:32}} onClick={() => navigate('#/')}>Back to Shop</button>
        </div>
      </div>
    );
  }

  // ── Approved dashboard ──
  return (
    <div style={{paddingTop:76, minHeight:'100vh', background:'var(--cream)'}}>
      <div style={{maxWidth:900, margin:'0 auto', padding:'40px 36px 80px'}}>
        <button onClick={() => navigate('#/')} style={{display:'flex',alignItems:'center',gap:6,color:'var(--saddle)',fontWeight:600,fontSize:14,background:'none',border:'none',cursor:'pointer',padding:0,marginBottom:8}}>
          <Icon.Back /> Back to Shop
        </button>
        <div style={{marginBottom:32}}>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,4vw,38px)',fontWeight:600,color:'var(--earth)'}}>
            {artisan.shop_name}
          </h1>
          <p style={{fontSize:14,color:'var(--muted)',marginTop:4}}>Manage your products and orders</p>
        </div>

        <div className="admin-tabs" style={{borderBottom:'1px solid #F0E6D8',marginBottom:0}}>
          {tabs.map(([key,label]) => (
            <button key={key} className={`admin-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        <div style={{padding:'28px 0'}}>
          {tab === 'products' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
                <span style={{fontSize:14,color:'var(--warm-gray)'}}>{products.length} products</span>
                <button className="btn btn-primary" onClick={() => setShowProductForm(!showProductForm)}>+ Add Product</button>
              </div>

              {showProductForm && (
                <div className="new-product-form">
                  <h3>New Product</h3>
                  <div className="form-grid">
                    <div>
                      <label className="form-label">Product Name</label>
                      <input className="form-input" value={productForm.name} onChange={e => setProductForm({...productForm, name:e.target.value})} placeholder="e.g. Katsina Rattan Chair" />
                    </div>
                    <div>
                      <label className="form-label">Price (₦)</label>
                      <input className="form-input" type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price:e.target.value})} placeholder="e.g. 150000" />
                    </div>
                    <div>
                      <label className="form-label">Category</label>
                      <select className="form-input form-select" value={productForm.category_id} onChange={e => setProductForm({...productForm, category_id:e.target.value})}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Stock Quantity</label>
                      <input className="form-input" type="number" value={productForm.stock_quantity} onChange={e => setProductForm({...productForm, stock_quantity:e.target.value})} />
                    </div>
                    <div className="form-full">
                      <label className="form-label">Description</label>
                      <textarea className="form-input form-textarea" value={productForm.description} onChange={e => setProductForm({...productForm, description:e.target.value})} placeholder="Describe your product..." />
                    </div>
                    <div className="form-full">
                      <label className="form-label">Product Images</label>
                      <input type="file" accept="image/*" multiple onChange={e => setProductImages(Array.from(e.target.files))} style={{fontSize:13,color:'var(--warm-gray)'}} />
                      {productImages.length > 0 && <p style={{fontSize:12,color:'var(--muted)',marginTop:6}}>{productImages.length} file(s) selected — first image will be the primary</p>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:12,marginTop:22,justifyContent:'flex-end'}}>
                    <button className="btn btn-outline" onClick={() => setShowProductForm(false)}>Cancel</button>
                    <button className="btn btn-rattan" onClick={handleAddProduct} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Submit for Review'}
                    </button>
                  </div>
                </div>
              )}

              {loading ? <div className="spinner" /> : products.map(p => (
                <div key={p.id} className="p-row">
                  <div className="p-row-thumb">
                    {p.product_images?.[0]?.url ? <img src={p.product_images[0].url} alt="" /> : <span style={{fontSize:20,opacity:0.22}}>🪑</span>}
                  </div>
                  <div className="p-row-info">
                    <p className="p-row-name">{p.name}</p>
                    <p className="p-row-meta">{p.categories?.name} · <StatusBadge status={p.status} /></p>
                  </div>
                  <span className="p-row-price">{fmt(p.price)}</span>
                  <div className="p-row-actions">
                    <button className="icon-btn icon-btn--danger" onClick={() => handleDeleteProduct(p.id)}><Icon.Trash /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'shop' && (
            <div>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:600,marginBottom:16,color:'var(--earth)'}}>Shop Details</h3>
              <div style={{background:'#FAF5ED',borderRadius:16,padding:24,border:'1px solid #E0D5C4'}}>
                <p style={{fontSize:14}}><strong>Shop Name:</strong> {artisan.shop_name}</p>
                <p style={{fontSize:14,marginTop:8}}><strong>Location:</strong> {artisan.location}</p>
                <p style={{fontSize:14,marginTop:8}}><strong>Status:</strong> <StatusBadge status={artisan.status} /></p>
                {artisan.bio && <p style={{fontSize:14,marginTop:8}}><strong>Bio:</strong> {artisan.bio}</p>}
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="panel-empty"><Icon.Truck /><p>No orders yet</p><p>Orders will appear here once customers purchase your products</p></div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   ADMIN PANEL
   ───────────────────────────────────────────────────────── */

function AdminPanel({ navigate }) {
  const { profile } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('artisans');
  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAdmin(); }, []);

  const loadAdmin = async () => {
    setLoading(true);
    const { data: arts } = await supabase.from('artisans').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
    const { data: prods } = await supabase.from('products').select('*, artisans(shop_name), categories(name)').order('created_at', { ascending: false });
    setArtisans(arts || []);
    setProducts(prods || []);
    setLoading(false);
  };

  const updateArtisan = async (id, status, note = '') => {
    const updates = { status, admin_note: note };
    if (status === 'approved') updates.approved_at = new Date().toISOString();
    await supabase.from('artisans').update(updates).eq('id', id);
    toast(`Artisan ${status}`, 'success');
    loadAdmin();
  };

  const updateProduct = async (id, status, note = '') => {
    await supabase.from('products').update({ status, admin_note: note }).eq('id', id);
    toast(`Product ${status}`, 'success');
    loadAdmin();
  };

  if (profile?.role !== 'admin') {
    return (
      <div style={{paddingTop:76, minHeight:'100vh', background:'var(--cream)', textAlign:'center', padding:'140px 20px'}}>
        <div style={{fontSize:56,marginBottom:16}}>🔒</div>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:28,color:'var(--earth)'}}>Access Denied</h2>
        <p style={{color:'var(--muted)',marginTop:8}}>You need admin privileges to access this page.</p>
        <button className="btn btn-outline" style={{marginTop:24}} onClick={() => navigate('#/')}>Back to Shop</button>
      </div>
    );
  }

  const pendingArtisans = artisans.filter(a => a.status === 'pending');
  const pendingProducts = products.filter(p => p.status === 'pending');

  return (
    <div style={{paddingTop:76, minHeight:'100vh', background:'var(--cream)'}}>
      <div style={{maxWidth:1000, margin:'0 auto', padding:'40px 36px 80px'}}>
        <button onClick={() => navigate('#/')} style={{display:'flex',alignItems:'center',gap:6,color:'var(--saddle)',fontWeight:600,fontSize:14,background:'none',border:'none',cursor:'pointer',padding:0,marginBottom:8}}>
          <Icon.Back /> Back to Shop
        </button>
        <div style={{marginBottom:32}}>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,4vw,38px)',fontWeight:600,color:'var(--earth)'}}>Admin Panel</h1>
          <p style={{fontSize:14,color:'var(--muted)',marginTop:4}}>
            {pendingArtisans.length > 0 && <span style={{color:'var(--saddle)',fontWeight:600}}>{pendingArtisans.length} artisan(s) pending · </span>}
            {pendingProducts.length > 0 && <span style={{color:'var(--saddle)',fontWeight:600}}>{pendingProducts.length} product(s) pending</span>}
            {pendingArtisans.length === 0 && pendingProducts.length === 0 && 'All caught up!'}
          </p>
        </div>

        <div className="admin-tabs" style={{borderBottom:'1px solid #F0E6D8'}}>
          {[['artisans',`Artisans (${artisans.length})`],['products',`Products (${products.length})`],['overview','Overview']].map(([key,label]) => (
            <button key={key} className={`admin-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        <div style={{padding:'28px 0'}}>
          {loading && <div className="spinner" />}

          {/* ARTISANS TAB */}
          {!loading && tab === 'artisans' && (
            <div>
              {artisans.length === 0 ? (
                <div className="panel-empty"><p>No artisan applications yet</p></div>
              ) : artisans.map(a => (
                <div key={a.id} className="p-row" style={{flexWrap:'wrap',gap:12}}>
                  <div className="artisan-avatar" style={{background:'rgba(200,145,58,0.12)',width:42,height:42,fontSize:18}}>{a.shop_name[0]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p className="p-row-name">{a.shop_name}</p>
                    <p className="p-row-meta">{a.profiles?.full_name} · {a.location} · {a.profiles?.email}</p>
                  </div>
                  <StatusBadge status={a.status} />
                  {a.status === 'pending' && (
                    <div style={{display:'flex',gap:8}}>
                      <button className="btn btn-primary" style={{padding:'7px 16px',fontSize:12}} onClick={() => updateArtisan(a.id, 'approved')}>Approve</button>
                      <button className="btn btn-outline" style={{padding:'7px 16px',fontSize:12,color:'var(--danger)',borderColor:'var(--danger)'}} onClick={() => updateArtisan(a.id, 'rejected', 'Does not meet criteria')}>Reject</button>
                    </div>
                  )}
                  {a.status === 'approved' && (
                    <button className="btn btn-outline" style={{padding:'7px 16px',fontSize:12}} onClick={() => updateArtisan(a.id, 'suspended')}>Suspend</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PRODUCTS TAB */}
          {!loading && tab === 'products' && (
            <div>
              {products.length === 0 ? (
                <div className="panel-empty"><p>No products submitted yet</p></div>
              ) : products.map(p => (
                <div key={p.id} className="p-row" style={{flexWrap:'wrap',gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <p className="p-row-name">{p.name}</p>
                    <p className="p-row-meta">{p.artisans?.shop_name} · {p.categories?.name} · {fmt(p.price)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                  {p.status === 'pending' && (
                    <div style={{display:'flex',gap:8}}>
                      <button className="btn btn-primary" style={{padding:'7px 16px',fontSize:12}} onClick={() => updateProduct(p.id, 'approved')}>Approve</button>
                      <button className="btn btn-outline" style={{padding:'7px 16px',fontSize:12,color:'var(--danger)',borderColor:'var(--danger)'}} onClick={() => updateProduct(p.id, 'rejected')}>Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* OVERVIEW TAB */}
          {!loading && tab === 'overview' && (
            <div className="stat-grid">
              {[['Total Artisans', artisans.length, ''],['Pending Approvals', pendingArtisans.length, ''],['Total Products', products.length, ''],['Pending Products', pendingProducts.length, '']].map(([label,value,change]) => (
                <div key={label} className="stat-card"><p className="stat-label">{label}</p><p className="stat-value">{value}</p>{change && <p className="stat-change">{change}</p>}</div>
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
            <p className="footer-brand-desc">Celebrating Katsina's rich heritage through handcrafted furniture and home accessories.</p>
          </div>
          <div>
            <h4 className="footer-col-title">Shop</h4>
            {['All Products','Chairs','Tables','Storage','Lighting'].map(l => <a key={l} href="#/" className="footer-link">{l}</a>)}
          </div>
          <div>
            <h4 className="footer-col-title">Artisans</h4>
            {['Join as Artisan','Artisan Directory','Success Stories'].map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
          </div>
          <div>
            <h4 className="footer-col-title">Help</h4>
            {['Contact Us','Shipping Info','Returns Policy','Track Order'].map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'signup' | null

  const handleAddCart = () => setCartCount(c => c + 1);

  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  const isDashboard = route.startsWith('#/dashboard');
  const isAdmin = route.startsWith('#/admin');

  return (
    <AuthProvider>
      <ToastProvider>
        <Navbar route={route} navigate={navigate} cartCount={cartCount} onAuthClick={setAuthModal} />

        {isAdmin ? (
          <AdminPanel navigate={navigate} />
        ) : isDashboard ? (
          <Dashboard navigate={navigate} />
        ) : (
          <Storefront navigate={navigate} onSelectProduct={setSelectedProduct} onAddCart={handleAddCart} onAuthClick={setAuthModal} />
        )}

        <Footer />

        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddCart={handleAddCart} />}
        {authModal && <AuthModal onClose={() => setAuthModal(null)} initialMode={authModal} />}
      </ToastProvider>
    </AuthProvider>
  );
}


/* ── MOUNT ─────────────────────────────────────────────── */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
