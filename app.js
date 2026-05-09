/* ═══════════════════════════════════════════════════════════
   KATSINA CRAFTS — APP.JS
   Supabase-powered marketplace
   Views: Storefront · Artisan Dashboard · Admin Panel
   ═══════════════════════════════════════════════════════════ */

const { useState, useEffect, useRef, useCallback } = React;

/* ─────────────────────────────────────────────────────────
   SUPABASE CLIENT
   ───────────────────────────────────────────────────────── */

const SUPABASE_URL = 'https://tngqzkbgppfcshovdbmu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tjNwrmFH2w5Ds4MQPhnB7w_siwnpnsk';
const supabase = supabase_js.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


/* ─────────────────────────────────────────────────────────
   STATIC DATA (fallback while DB is empty)
   ───────────────────────────────────────────────────────── */

const SEED_PRODUCTS = [
  { id:1, name:"Katsina Rattan Armchair", price:185000, category:"Chairs", artisan_name:"Malam Sani Crafts", description:"Hand-woven rattan back with solid wood frame. Inspired by traditional Hausa sitting rooms, this armchair blends comfort with heritage craftsmanship.", img_url:"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80", rating:4.8, review_count:24, is_featured:true, tag:"Best Seller", status:"approved" },
  { id:2, name:"Daura Lounge Chair", price:142000, category:"Chairs", artisan_name:"Abdullahi Woodworks", description:"Scandinavian-meets-Sahel design. Cane-backed barrel chair with cushioned seat, perfect for modern Nigerian living spaces.", img_url:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", rating:4.6, review_count:18, is_featured:true, tag:"New Arrival", status:"approved" },
  { id:3, name:"Funtua Round Coffee Table", price:225000, category:"Tables", artisan_name:"Katsina Heritage Furniture", description:"Statement round coffee table with rattan-wrapped drum base and rich walnut top. Features hidden storage shelf.", img_url:"https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&q=80", rating:4.9, review_count:31, is_featured:true, tag:"Editor's Pick", status:"approved" },
  { id:4, name:"Durbar Sculptural Table", price:198000, category:"Tables", artisan_name:"Malam Sani Crafts", description:"Sculptural walnut coffee table inspired by the flowing forms of Katsina Durbar festival drums. Three-legged organic base.", img_url:"https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600&q=80", rating:4.7, review_count:15, is_featured:false, tag:null, status:"approved" },
  { id:5, name:"Zango Woven Side Table", price:67000, category:"Tables", artisan_name:"Amina's Rattan Studio", description:"Compact side table featuring hand-woven rattan top on tapered mahogany legs.", img_url:null, rating:4.5, review_count:9, is_featured:false, tag:null, status:"approved" },
  { id:6, name:"Barkiya Rattan Shelf", price:156000, category:"Storage", artisan_name:"Abdullahi Woodworks", description:"Open shelving unit with rattan panel doors and solid wood frame.", img_url:null, rating:4.4, review_count:12, is_featured:false, tag:null, status:"approved" },
];

const SEED_ARTISANS = [
  { name:"Malam Sani Crafts",         location:"Katsina City",  product_count:23, rating:4.8, bg:"rgba(200,145,58,0.12)" },
  { name:"Abdullahi Woodworks",        location:"Daura",         product_count:18, rating:4.6, bg:"rgba(139,69,19,0.08)"  },
  { name:"Katsina Heritage Furniture", location:"Funtua",        product_count:31, rating:4.9, bg:"rgba(212,162,78,0.1)"  },
  { name:"Amina's Rattan Studio",      location:"Malumfashi",    product_count:14, rating:4.5, bg:"rgba(107,68,35,0.08)"  },
];

const CATEGORIES  = ["All","Chairs","Tables","Storage","Lighting","Decor","Outdoor"];
const MARQUEE     = ["Handwoven Rattan","Katsina Heritage","Sustainable Wood","Artisan Crafted","Made in Nigeria","Traditional Patterns","Modern Design","Cultural Pride"];
const PH_ICONS    = { Chairs:"🪑", Tables:"🪵", Storage:"📦", Lighting:"💡", Decor:"🏺", Outdoor:"🌿" };
const TAG_CLS     = { "Best Seller":"product-tag--best","New Arrival":"product-tag--new","Editor's Pick":"product-tag--pick","Premium":"product-tag--premium","New":"product-tag--default" };

const fmt = n => "₦" + Number(n).toLocaleString();


/* ─────────────────────────────────────────────────────────
   ICONS
   ───────────────────────────────────────────────────────── */

const Icon = {
  Heart:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bag:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5B4E" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Edit:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C75050" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Upload: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8913A" strokeWidth="1.5" style={{display:'block',margin:'0 auto 8px'}}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Check:  () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Truck:  () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D4C4B0" strokeWidth="1.3" style={{display:'block',margin:'0 auto 14px'}}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Back:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Menu:   () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D2B1F" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close:  () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D2B1F" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Eye:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  User:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
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

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === 'success' ? '#2D5016' : type === 'error' ? '#C75050' : '#C8913A';
  return (
    <div style={{
      position:'fixed', bottom:28, right:28, zIndex:9999,
      background:bg, color:'#fff',
      padding:'14px 22px', borderRadius:12,
      fontSize:14, fontWeight:500,
      boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
      display:'flex', alignItems:'center', gap:12,
      animation:'fadeUp 0.3s ease',
      maxWidth:360,
    }}>
      <span style={{flex:1}}>{message}</span>
      <button onClick={onClose} style={{background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:18,lineHeight:1}}>×</button>
    </div>
  );
}

function Spinner({ size = 20, color = '#C8913A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={{animation:'spin 0.8s linear infinite'}}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
    </svg>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:  { bg:'#FEF3C7', color:'#92400E', label:'Pending Review' },
    approved: { bg:'#D1FAE5', color:'#065F46', label:'Approved' },
    rejected: { bg:'#FEE2E2', color:'#991B1B', label:'Rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:600,background:s.bg,color:s.color,letterSpacing:0.5}}>
      {s.label}
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
   AUTH MODAL — Login / Signup
   ───────────────────────────────────────────────────────── */

function AuthModal({ mode, onClose, onSuccess, showToast }) {
  const [tab, setTab]         = useState(mode || 'login');
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    email:'', password:'', confirm_password:'',
    shop_name:'', owner_name:'', location:'', phone:'', bio:'',
  });

  const upd = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleLogin = async () => {
    if (!form.email || !form.password) return showToast('Please fill in all fields', 'error');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    if (error) return showToast(error.message, 'error');
    showToast('Welcome back!', 'success');
    onSuccess(data.user);
    onClose();
  };

  const handleSignup = async () => {
    if (!form.email || !form.password || !form.shop_name || !form.owner_name) return showToast('Please fill all required fields', 'error');
    if (form.password !== form.confirm_password) return showToast('Passwords do not match', 'error');
    if (form.password.length < 6) return showToast('Password must be at least 6 characters', 'error');
    setLoading(true);

    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { shop_name: form.shop_name, owner_name: form.owner_name, role: 'artisan' } }
    });

    if (error) { setLoading(false); return showToast(error.message, 'error'); }

    // 2. Create artisan profile
    const { error: profileError } = await supabase.from('artisans').insert({
      user_id:    data.user.id,
      email:      form.email,
      shop_name:  form.shop_name,
      owner_name: form.owner_name,
      location:   form.location,
      phone:      form.phone,
      bio:        form.bio,
      status:     'pending',
    });

    setLoading(false);
    if (profileError) return showToast(profileError.message, 'error');

    showToast('Application submitted! We\'ll review your shop and get back to you.', 'success');
    onClose();
  };

  const inputStyle = {
    width:'100%', padding:'12px 18px',
    borderRadius:10, border:'1.5px solid #E0D5C4',
    fontSize:14, background:'#FFFBF5', color:'#3D2B1F',
    outline:'none', fontFamily:'inherit',
    transition:'border-color 0.3s',
    boxSizing:'border-box',
  };
  const labelStyle = {
    display:'block', fontSize:11, fontWeight:600,
    color:'#8B7355', letterSpacing:0.8,
    textTransform:'uppercase', marginBottom:7,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{maxWidth:520}} onClick={e => e.stopPropagation()}>
        <div style={{padding:'28px 32px 0',borderBottom:'1px solid #F0E6D8',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',gap:0}}>
            {['login','signup'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding:'14px 24px', background:'none', border:'none',
                borderBottom: tab === t ? '2px solid #C8913A' : '2px solid transparent',
                color: tab === t ? '#8B4513' : '#B8956A',
                fontSize:14, fontWeight:600, cursor:'pointer',
                fontFamily:'inherit', transition:'all 0.3s',
              }}>
                {t === 'login' ? 'Log In' : 'Join as Artisan'}
              </button>
            ))}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{padding:'28px 32px 32px'}}>
          {tab === 'login' && (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="your@email.com"
                  onFocus={e => e.target.style.borderColor='#C8913A'} onBlur={e => e.target.style.borderColor='#E0D5C4'} />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input style={inputStyle} type="password" value={form.password} onChange={e => upd('password', e.target.value)} placeholder="••••••••"
                  onFocus={e => e.target.style.borderColor='#C8913A'} onBlur={e => e.target.style.borderColor='#E0D5C4'}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <button className="btn btn-primary btn-full" style={{marginTop:8,padding:'14px'}} onClick={handleLogin} disabled={loading}>
                {loading ? <Spinner size={18} color="#fff" /> : 'Log In'}
              </button>
              <p style={{textAlign:'center',fontSize:13,color:'#B8956A',margin:0}}>
                Want to sell? <button onClick={() => setTab('signup')} style={{background:'none',border:'none',color:'#8B4513',fontWeight:600,cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>Apply as an artisan →</button>
              </p>
            </div>
          )}

          {tab === 'signup' && (
            <div>
              <p style={{fontSize:13,color:'#8B7355',lineHeight:1.65,marginBottom:22}}>
                Apply to join Katsina Crafts as a verified artisan. We'll review your application and get back to you within 2–3 business days.
              </p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="your@email.com"
                    onFocus={e => e.target.style.borderColor='#C8913A'} onBlur={e => e.target.style.borderColor='#E0D5C4'} />
                </div>
                <div>
                  <label style={labelStyle}>Password *</label>
                  <input style={inputStyle} type="password" value={form.password} onChange={e => upd('password', e.target.value)} placeholder="Min. 6 characters"
                    onFocus={e => e.target.style.borderColor='#C8913A'} onBlur={e => e.target.style.borderColor='#E0D5C4'} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password *</label>
                  <input style={inputStyle} type="password" value={form.confirm_password} onChange={e => upd('confirm_password', e.target.value)} placeholder="Repeat password"
                    onFocus={e => e.target.style.borderColor='#C8913A'} onBlur={e => e.target.style.borderColor='#E0D5C4'} />
                </div>
                <div>
                  <label style={labelStyle}>Shop Name *</label>
                  <input style={inputStyle} value={form.shop_name} onChange={e => upd('shop_name', e.target.value)} placeholder="e.g. Sani's Rattan Crafts"
                    onFocus={e => e.target.style.borderColor='#C8913A'} onBlur={e => e.target.style.borderColor='#E0D5C4'} />
                </div>
                <div>
                  <label style={labelStyle}>Your Full Name *</label>
                  <input style={inputStyle} value={form.owner_name} onChange={e => upd('owner_name', e.target.value)} placeholder="Full name"
                    onFocus={e => e.target.style.borderColor='#C8913A'} onBlur={e => e.target.style.borderColor='#E0D5C4'} />
                </div>
                <div>
                  <label style={labelStyle}>Location in Katsina</label>
                  <input style={inputStyle} value={form.location} onChange={e => upd('location', e.target.value)} placeholder="e.g. Katsina City"
                    onFocus={e => e.target.style.borderColor='#C8913A'} onBlur={e => e.target.style.borderColor='#E0D5C4'} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+234..."
                    onFocus={e => e.target.style.borderColor='#C8913A'} onBlur={e => e.target.style.borderColor='#E0D5C4'} />
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={labelStyle}>Tell Us About Your Craft</label>
                  <textarea style={{...inputStyle,minHeight:80,resize:'vertical'}} value={form.bio} onChange={e => upd('bio', e.target.value)} placeholder="Your craft, experience, inspiration..."
                    onFocus={e => e.target.style.borderColor='#C8913A'} onBlur={e => e.target.style.borderColor='#E0D5C4'} />
                </div>
              </div>
              <button className="btn btn-primary btn-full" style={{marginTop:22,padding:'14px'}} onClick={handleSignup} disabled={loading}>
                {loading ? <Spinner size={18} color="#fff" /> : 'Submit Application'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   PRODUCT CARD
   ───────────────────────────────────────────────────────── */

function ProductCard({ product, onClick, onAddCart, delay = 0 }) {
  const [imgOk, setImgOk] = useState(true);
  const tagCls = product.tag ? (TAG_CLS[product.tag] || 'product-tag--default') : null;
  const imgSrc = product.img_url || product.img;

  return (
    <div className="product-card anim-fade-up" style={{animationDelay: delay+'s'}} onClick={() => onClick(product)}>
      <div className="product-img-wrap">
        {imgSrc && imgOk ? (
          <img className="product-img" src={imgSrc} alt={product.name} loading="lazy" onError={() => setImgOk(false)} />
        ) : (
          <div className="product-placeholder">
            <span className="product-placeholder-icon">{PH_ICONS[product.category] || '🏠'}</span>
            <span className="product-placeholder-label">Coming Soon</span>
          </div>
        )}
        {tagCls && <span className={`product-tag ${tagCls}`}>{product.tag}</span>}
        <button className="product-heart" onClick={e => e.stopPropagation()}><Icon.Heart /></button>
      </div>
      <div className="product-info">
        <p className="product-artisan">{product.artisan_name}</p>
        <h3 className="product-name">{product.name}</h3>
        {product.rating > 0 && <Stars rating={product.rating} size={12} />}
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
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box pm" onClick={e => e.stopPropagation()}>
        <div className="pm-body">
          <div className="pm-img-side">
            {(product.img_url || product.img)
              ? <img src={product.img_url || product.img} alt={product.name} />
              : <div className="pm-img-empty">🏠</div>
            }
          </div>
          <div className="pm-details">
            <button className="modal-close" onClick={onClose} style={{position:'absolute',top:16,right:16}}>×</button>
            <p className="pm-artisan">{product.artisan_name}</p>
            <h2 className="pm-name">{product.name}</h2>
            {product.rating > 0 && <span><Stars rating={product.rating} /><span className="pm-reviews">({product.review_count} reviews)</span></span>}
            <p className="pm-price">{fmt(product.price)}</p>
            <p className="pm-desc">{product.description}</p>
            <div className="pm-tags">
              <span className="pm-tag">{product.category}</span>
              <span className="pm-tag">Handcrafted</span>
              <span className="pm-tag">Made in Katsina</span>
            </div>
            <div className="pm-actions">
              <button className="pm-btn-cart" onClick={() => { onAddCart(product); onClose(); }}>Add to Cart</button>
              <button className="pm-btn-wish"><Icon.Heart /></button>
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

function Storefront({ onSelectProduct, onAddCart, navigate, onOpenAuth }) {
  const [products, setProducts]         = useState(SEED_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState('featured');
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, artisans(shop_name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const mapped = data.map(p => ({ ...p, artisan_name: p.artisans?.shop_name || 'Katsina Artisan' }));
        setProducts(mapped);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = products
    .filter(p => activeCategory === 'All' || p.category === activeCategory)
    .filter(p => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q) || (p.artisan_name||'').toLowerCase().includes(q);
    })
    .sort((a,b) => {
      if (sortBy === 'price-low')  return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating')     return (b.rating||0) - (a.rating||0);
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
            <button className="btn btn-outline btn-lg" onClick={() => onOpenAuth('signup')}>Become an Artisan</button>
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

      {/* MARQUEE */}
      <div className="marquee-bar">
        <div className="marquee-track">
          {[0,1].flatMap(j => MARQUEE.map((w,i) => (
            <span key={`${j}-${i}`} className="marquee-item"><span className="marquee-dot"/>{w}</span>
          )))}
        </div>
      </div>

      {/* ARTISANS */}
      <section className="section" style={{paddingBottom:32}}>
        <div className="section-header">
          <div><p className="section-label">Meet the Makers</p><h2 className="section-title">Our Artisans</h2></div>
          <a href="#" className="view-all">View All <span>→</span></a>
        </div>
        <div className="artisans-grid">
          {SEED_ARTISANS.map((a,i) => (
            <div key={a.name} className="artisan-card anim-fade-up" style={{animationDelay:i*0.1+'s'}}>
              <div className="artisan-top">
                <div className="artisan-avatar" style={{background:a.bg}}>{a.name[0]}</div>
                <div><p className="artisan-name">{a.name}</p><p className="artisan-loc">{a.location}, Katsina</p></div>
              </div>
              <div className="artisan-bottom">
                <span className="artisan-count">{a.product_count} products</span>
                <Stars rating={a.rating} size={11} />
              </div>
            </div>
          ))}
        </div>
      </section>

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
            {CATEGORIES.map(c => (
              <button key={c} className={`cat-pill${activeCategory===c?' active':''}`} onClick={() => setActiveCategory(c)}>{c}</button>
            ))}
          </div>
          <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <p className="results-count">{loading ? 'Loading...' : `${filtered.length} piece${filtered.length !== 1 ? 's' : ''} found`}</p>

        {filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map((p,i) => <ProductCard key={p.id} product={p} onClick={onSelectProduct} onAddCart={onAddCart} delay={i*0.06} />)}
          </div>
        ) : !loading && (
          <div className="empty-state">
            <p className="empty-state-icon">🔍</p>
            <p className="empty-state-title">No pieces found</p>
            <p className="empty-state-sub">Try adjusting your search or filters</p>
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
            {[['🌿','Sustainably Sourced','Local woods and rattan harvested responsibly from Katsina forests.'],
              ['🤲','Handcrafted','Every piece made by hand using techniques passed through generations.'],
              ['🏛️','Cultural Heritage','Designs inspired by Hausa architecture and Katsina\'s artistic legacy.'],
              ['🚚','Nationwide Delivery','We ship across Nigeria — from Katsina to your doorstep.'],
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

function ArtisanDashboard({ user, artisan, navigate, showToast }) {
  const [tab, setTab]           = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgFile, setImgFile]   = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name:'', price:'', category:'Chairs', description:'', tag:'',
  });
  const upd = (k,v) => setForm(f => ({...f, [k]:v}));

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('artisan_id', artisan.id)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.price) return showToast('Name and price are required', 'error');
    if (artisan.status !== 'approved') return showToast('Your account must be approved before listing products', 'error');
    setSubmitting(true);

    let img_url = null;

    // Upload image if selected
    if (imgFile) {
      const ext  = imgFile.name.split('.').pop();
      const path = `${artisan.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imgFile);
      if (uploadError) { setSubmitting(false); return showToast('Image upload failed: ' + uploadError.message, 'error'); }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      img_url = urlData.publicUrl;
    }

    const { error } = await supabase.from('products').insert({
      artisan_id:   artisan.id,
      artisan_name: artisan.shop_name,
      name:         form.name,
      price:        parseInt(form.price),
      category:     form.category,
      description:  form.description,
      tag:          form.tag || null,
      img_url,
      status:       'pending',
      rating:       0,
      review_count: 0,
      is_featured:  false,
    });

    setSubmitting(false);
    if (error) return showToast(error.message, 'error');

    showToast('Product submitted for review!', 'success');
    setForm({ name:'', price:'', category:'Chairs', description:'', tag:'' });
    setImgFile(null); setImgPreview(null);
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await supabase.from('products').delete().eq('id', id);
    showToast('Product removed', 'info');
    fetchProducts();
  };

  const tabs = [['products','My Products'],['shop','Shop Profile'],['orders','Orders'],['analytics','Analytics']];

  return (
    <div style={{paddingTop:76,minHeight:'100vh',background:'var(--cream)'}}>
      <div style={{maxWidth:920,margin:'0 auto',padding:'40px 36px 80px'}}>

        <button onClick={() => navigate('#/')} style={{display:'flex',alignItems:'center',gap:6,color:'var(--saddle)',fontWeight:600,fontSize:14,background:'none',border:'none',cursor:'pointer',padding:0,marginBottom:20}}>
          <Icon.Back /> Back to Shop
        </button>

        {/* Status Banner */}
        {artisan.status === 'pending' && (
          <div style={{background:'#FEF3C7',border:'1px solid #F59E0B',borderRadius:12,padding:'14px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:20}}>⏳</span>
            <div>
              <p style={{fontSize:14,fontWeight:600,color:'#92400E',margin:0}}>Application Under Review</p>
              <p style={{fontSize:13,color:'#B45309',margin:'2px 0 0'}}>Your artisan account is pending approval. You can set up your profile but won't be able to list products until approved.</p>
            </div>
          </div>
        )}
        {artisan.status === 'rejected' && (
          <div style={{background:'#FEE2E2',border:'1px solid #EF4444',borderRadius:12,padding:'14px 20px',marginBottom:24}}>
            <p style={{fontSize:14,fontWeight:600,color:'#991B1B',margin:0}}>Application Not Approved</p>
            <p style={{fontSize:13,color:'#B91C1C',margin:'4px 0 0'}}>Unfortunately your application was not approved at this time. Please contact us for more information.</p>
          </div>
        )}

        <div style={{marginBottom:28}}>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,4vw,36px)',fontWeight:600,color:'var(--earth)',letterSpacing:'-0.5px'}}>
            {artisan.shop_name}
          </h1>
          <div style={{display:'flex',alignItems:'center',gap:12,marginTop:6}}>
            <p style={{fontSize:14,color:'var(--muted)',margin:0}}>{artisan.location} · {artisan.email}</p>
            <StatusBadge status={artisan.status} />
          </div>
        </div>

        <div className="admin-tabs" style={{borderBottom:'1px solid #F0E6D8',marginBottom:0}}>
          {tabs.map(([key,label]) => (
            <button key={key} className={`admin-tab${tab===key?' active':''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        <div style={{paddingTop:28}}>

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
                <span style={{fontSize:14,color:'var(--warm-gray)'}}>{products.length} products listed</span>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} disabled={artisan.status !== 'approved'}>
                  + Add Product
                </button>
              </div>

              {showForm && (
                <div className="new-product-form">
                  <h3>New Product</h3>
                  <div className="form-grid">
                    <div>
                      <label className="form-label">Product Name *</label>
                      <input className="form-input" value={form.name} onChange={e => upd('name',e.target.value)} placeholder="e.g. Katsina Rattan Chair" />
                    </div>
                    <div>
                      <label className="form-label">Price (₦) *</label>
                      <input className="form-input" type="number" value={form.price} onChange={e => upd('price',e.target.value)} placeholder="e.g. 150000" />
                    </div>
                    <div>
                      <label className="form-label">Category</label>
                      <select className="form-input form-select" value={form.category} onChange={e => upd('category',e.target.value)}>
                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Tag (optional)</label>
                      <select className="form-input form-select" value={form.tag} onChange={e => upd('tag',e.target.value)}>
                        <option value="">None</option>
                        <option>New Arrival</option>
                        <option>Best Seller</option>
                        <option>Premium</option>
                      </select>
                    </div>
                    <div className="form-full">
                      <label className="form-label">Description</label>
                      <textarea className="form-input form-textarea" value={form.description} onChange={e => upd('description',e.target.value)} placeholder="Describe your product — materials, dimensions, inspiration..." />
                    </div>
                    <div className="form-full">
                      <label className="form-label">Product Image</label>
                      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageChange} />
                      <div className="upload-zone" onClick={() => fileRef.current.click()}>
                        {imgPreview
                          ? <img src={imgPreview} alt="preview" style={{height:120,objectFit:'contain',margin:'0 auto',borderRadius:8}} />
                          : <><Icon.Upload /><p>Click to upload image</p><p className="hint">PNG, JPG up to 5MB</p></>
                        }
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:12,marginTop:22,justifyContent:'flex-end'}}>
                    <button className="btn btn-outline" onClick={() => { setShowForm(false); setImgPreview(null); setImgFile(null); }}>Cancel</button>
                    <button className="btn btn-rattan" onClick={handleAddProduct} disabled={submitting}>
                      {submitting ? <Spinner size={16} color="#fff" /> : 'Submit for Review'}
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div style={{textAlign:'center',padding:40}}><Spinner size={32} /></div>
              ) : products.length === 0 ? (
                <div className="panel-empty">
                  <p style={{fontSize:32,opacity:0.2}}>📦</p>
                  <p>No products yet</p>
                  <p>{artisan.status === 'approved' ? 'Click "+ Add Product" to list your first piece.' : 'Once approved, you can start listing your products.'}</p>
                </div>
              ) : (
                products.map(p => (
                  <div key={p.id} className="p-row">
                    <div className="p-row-thumb">
                      {p.img_url ? <img src={p.img_url} alt="" /> : <span style={{fontSize:20,opacity:0.22}}>🪑</span>}
                    </div>
                    <div className="p-row-info">
                      <p className="p-row-name">{p.name}</p>
                      <p className="p-row-meta">{p.category} · {fmt(p.price)}</p>
                    </div>
                    <StatusBadge status={p.status} />
                    <div className="p-row-actions">
                      <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(p.id)}><Icon.Trash /></button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* SHOP PROFILE TAB */}
          {tab === 'shop' && (
            <div>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:600,marginBottom:20,color:'var(--earth)'}}>Shop Profile</h3>
              <div className="form-grid">
                {[['Shop Name', artisan.shop_name],['Owner', artisan.owner_name],['Location', artisan.location],['Phone', artisan.phone]].map(([label,val]) => (
                  <div key={label}>
                    <label className="form-label">{label}</label>
                    <div style={{padding:'12px 18px',background:'#FAF5ED',borderRadius:10,border:'1px solid #E0D5C4',fontSize:14,color:'var(--earth)'}}>{val || '—'}</div>
                  </div>
                ))}
                <div className="form-full">
                  <label className="form-label">Bio</label>
                  <div style={{padding:'12px 18px',background:'#FAF5ED',borderRadius:10,border:'1px solid #E0D5C4',fontSize:14,color:'var(--earth)',lineHeight:1.6}}>{artisan.bio || '—'}</div>
                </div>
              </div>
              <p style={{fontSize:12,color:'var(--muted)',marginTop:16}}>To update your shop details, please contact the Katsina Crafts admin team.</p>
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div className="panel-empty"><Icon.Truck /><p>No orders yet</p><p>Orders will appear here once customers purchase your products</p></div>
          )}

          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <div className="stat-grid">
              {[['Products Listed',String(products.length),''],['Approved',String(products.filter(p=>p.status==='approved').length),''],['Pending Review',String(products.filter(p=>p.status==='pending').length),''],['Views','—','']].map(([label,value,change]) => (
                <div key={label} className="stat-card">
                  <p className="stat-label">{label}</p>
                  <p className="stat-value">{value}</p>
                  {change && <p className="stat-change">{change}</p>}
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
   ADMIN PANEL
   ───────────────────────────────────────────────────────── */

function AdminPanel({ navigate, showToast }) {
  const [tab, setTab]           = useState('artisans');
  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchArtisans = async () => {
    const { data } = await supabase.from('artisans').select('*').order('created_at', { ascending: false });
    setArtisans(data || []);
  };
  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*, artisans(shop_name)').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchArtisans(); fetchProducts(); }, []);

  const updateArtisanStatus = async (id, status) => {
    await supabase.from('artisans').update({ status }).eq('id', id);
    showToast(`Artisan ${status}`, status === 'approved' ? 'success' : 'error');
    fetchArtisans();
  };

  const updateProductStatus = async (id, status) => {
    await supabase.from('products').update({ status }).eq('id', id);
    showToast(`Product ${status}`, status === 'approved' ? 'success' : 'error');
    fetchProducts();
  };

  const tabs = [['artisans','Artisans'],['products','Products'],['analytics','Analytics']];

  const pending_artisans  = artisans.filter(a => a.status === 'pending');
  const pending_products  = products.filter(p => p.status === 'pending');

  return (
    <div style={{paddingTop:76,minHeight:'100vh',background:'var(--cream)'}}>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'40px 36px 80px'}}>

        <button onClick={() => navigate('#/')} style={{display:'flex',alignItems:'center',gap:6,color:'var(--saddle)',fontWeight:600,fontSize:14,background:'none',border:'none',cursor:'pointer',padding:0,marginBottom:20}}>
          <Icon.Back /> Back to Shop
        </button>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
          <div>
            <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,4vw,36px)',fontWeight:600,color:'var(--earth)',letterSpacing:'-0.5px'}}>Admin Panel</h1>
            <p style={{fontSize:14,color:'var(--muted)',marginTop:4}}>Manage artisans, products, and platform oversight</p>
          </div>
          <div style={{display:'flex',gap:12}}>
            {pending_artisans.length > 0 && <span style={{background:'#FEF3C7',color:'#92400E',padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600}}>{pending_artisans.length} artisans pending</span>}
            {pending_products.length > 0 && <span style={{background:'#DBEAFE',color:'#1E40AF',padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600}}>{pending_products.length} products pending</span>}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stat-grid" style={{marginBottom:32}}>
          {[['Total Artisans',String(artisans.length)],['Approved Artisans',String(artisans.filter(a=>a.status==='approved').length)],['Total Products',String(products.length)],['Live Products',String(products.filter(p=>p.status==='approved').length)]].map(([label,val]) => (
            <div key={label} className="stat-card">
              <p className="stat-label">{label}</p>
              <p className="stat-value">{val}</p>
            </div>
          ))}
        </div>

        <div className="admin-tabs" style={{borderBottom:'1px solid #F0E6D8'}}>
          {tabs.map(([key,label]) => (
            <button key={key} className={`admin-tab${tab===key?' active':''}`} onClick={() => setTab(key)}>
              {label}
              {key==='artisans' && pending_artisans.length > 0 && <span style={{marginLeft:6,background:'#F59E0B',color:'#fff',borderRadius:'50%',width:18,height:18,fontSize:10,fontWeight:700,display:'inline-flex',alignItems:'center',justifyContent:'center'}}>{pending_artisans.length}</span>}
              {key==='products' && pending_products.length > 0 && <span style={{marginLeft:6,background:'#3B82F6',color:'#fff',borderRadius:'50%',width:18,height:18,fontSize:10,fontWeight:700,display:'inline-flex',alignItems:'center',justifyContent:'center'}}>{pending_products.length}</span>}
            </button>
          ))}
        </div>

        <div style={{paddingTop:28}}>

          {/* ARTISANS TAB */}
          {tab === 'artisans' && (
            <>
              {loading ? <div style={{textAlign:'center',padding:40}}><Spinner size={32} /></div> : artisans.length === 0 ? (
                <div className="panel-empty"><p style={{fontSize:32,opacity:0.2}}>👤</p><p>No artisan applications yet</p><p>Applications will appear here when artisans sign up</p></div>
              ) : (
                artisans.map(a => (
                  <div key={a.id} className="p-row" style={{flexWrap:'wrap',gap:12}}>
                    <div className="artisan-avatar" style={{background:'rgba(200,145,58,0.12)',width:44,height:44,flexShrink:0}}>{a.shop_name[0]}</div>
                    <div className="p-row-info">
                      <p className="p-row-name">{a.shop_name}</p>
                      <p className="p-row-meta">{a.owner_name} · {a.location || 'Katsina'} · {a.email}</p>
                      {a.bio && <p style={{fontSize:12,color:'var(--warm-gray)',marginTop:4,lineHeight:1.5}}>{a.bio.slice(0,100)}{a.bio.length>100?'...':''}</p>}
                    </div>
                    <StatusBadge status={a.status} />
                    <div className="p-row-actions">
                      {a.status !== 'approved' && (
                        <button onClick={() => updateArtisanStatus(a.id,'approved')} style={{padding:'7px 16px',background:'var(--green)',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Approve</button>
                      )}
                      {a.status !== 'rejected' && (
                        <button onClick={() => updateArtisanStatus(a.id,'rejected')} style={{padding:'7px 16px',background:'var(--danger)',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Reject</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <>
              {loading ? <div style={{textAlign:'center',padding:40}}><Spinner size={32} /></div> : products.length === 0 ? (
                <div className="panel-empty"><p style={{fontSize:32,opacity:0.2}}>📦</p><p>No products yet</p><p>Products submitted by artisans will appear here</p></div>
              ) : (
                products.map(p => (
                  <div key={p.id} className="p-row" style={{flexWrap:'wrap',gap:12}}>
                    <div className="p-row-thumb">
                      {p.img_url ? <img src={p.img_url} alt="" /> : <span style={{fontSize:20,opacity:0.22}}>🪑</span>}
                    </div>
                    <div className="p-row-info">
                      <p className="p-row-name">{p.name}</p>
                      <p className="p-row-meta">{p.artisans?.shop_name || p.artisan_name} · {p.category} · {fmt(p.price)}</p>
                    </div>
                    <StatusBadge status={p.status} />
                    <div className="p-row-actions">
                      {p.status !== 'approved' && (
                        <button onClick={() => updateProductStatus(p.id,'approved')} style={{padding:'7px 16px',background:'var(--green)',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Approve</button>
                      )}
                      {p.status !== 'rejected' && (
                        <button onClick={() => updateProductStatus(p.id,'rejected')} style={{padding:'7px 16px',background:'var(--danger)',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Reject</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <div style={{textAlign:'center',padding:'48px 20px',color:'var(--muted)'}}>
              <p style={{fontSize:32,opacity:0.2,marginBottom:16}}>📊</p>
              <p style={{fontSize:16,fontWeight:500}}>Analytics coming soon</p>
              <p style={{fontSize:13,marginTop:8}}>Revenue tracking, sales trends, and platform metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   NAVIGATION
   ───────────────────────────────────────────────────────── */

function Navbar({ route, navigate, cartCount, user, artisan, onOpenAuth, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive:true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const isAdmin     = artisan?.role === 'admin' || user?.email === 'admin@katsinacrafts.com';
  const isDashboard = route.startsWith('#/dashboard');
  const isAdmin_r   = route.startsWith('#/admin');

  return (
    <nav className={`nav${scrolled?' scrolled':''}`}>
      <div className="nav-inner">
        <a href="#/" className="nav-logo">
          <div className="nav-logo-icon">K</div>
          <span className="nav-logo-text">Katsina<em>Crafts</em></span>
        </a>

        <div className="nav-links">
          <a href="#/" className="nav-link">Shop</a>
          <a href="#/" className="nav-link">Artisans</a>
          <a href="#/" className="nav-link">Heritage</a>
          <a href="#" className="nav-link">About</a>

          {user ? (
            <>
              {isAdmin && <button className="btn btn-outline" style={{fontSize:12,padding:'8px 16px'}} onClick={() => navigate('#/admin')}>Admin Panel</button>}
              <button className="btn btn-primary" onClick={() => navigate('#/dashboard')} style={{fontSize:12,padding:'8px 16px'}}>
                <Icon.User /> My Shop
              </button>
              <button onClick={onLogout} style={{display:'flex',alignItems:'center',gap:6,color:'var(--warm-gray)',background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:500}}>
                <Icon.LogOut /> Log out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" style={{fontSize:12,padding:'8px 16px'}} onClick={() => onOpenAuth('login')}>Log In</button>
              <button className="btn btn-primary" onClick={() => onOpenAuth('signup')}>Sell on Katsina</button>
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
            <p className="footer-brand-desc">Celebrating Katsina's rich heritage through handcrafted furniture and home accessories. Every piece tells a story.</p>
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
  const { route, navigate }     = useHashRouter();
  const [user, setUser]         = useState(null);
  const [artisan, setArtisan]   = useState(null);
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'signup'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast]       = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Restore session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchArtisan(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) { setUser(session.user); fetchArtisan(session.user.id); }
      else { setUser(null); setArtisan(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchArtisan = async (userId) => {
    const { data } = await supabase.from('artisans').select('*').eq('user_id', userId).single();
    if (data) setArtisan(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setArtisan(null);
    navigate('#/');
    showToast('Logged out successfully');
  };

  const handleAuthSuccess = (u) => {
    setUser(u);
    fetchArtisan(u.id);
  };

  useEffect(() => { window.scrollTo(0,0); }, [route]);

  const isAdmin = user?.email === 'admin@katsinacrafts.com';

  return (
    <>
      <Navbar
        route={route} navigate={navigate} cartCount={cartCount}
        user={user} artisan={artisan}
        onOpenAuth={(mode) => setAuthMode(mode)}
        onLogout={handleLogout}
      />

      {route.startsWith('#/admin') && isAdmin
        ? <AdminPanel navigate={navigate} showToast={showToast} />
        : route.startsWith('#/dashboard') && user && artisan
        ? <ArtisanDashboard user={user} artisan={artisan} navigate={navigate} showToast={showToast} />
        : route.startsWith('#/dashboard') && user && !artisan
        ? <div style={{paddingTop:120,textAlign:'center',color:'var(--muted)'}}><Spinner size={36} /><p style={{marginTop:16}}>Loading your profile...</p></div>
        : route.startsWith('#/dashboard') && !user
        ? (() => { navigate('#/'); setAuthMode('login'); return null; })()
        : <Storefront onSelectProduct={setSelectedProduct} onAddCart={() => setCartCount(c=>c+1)} navigate={navigate} onOpenAuth={setAuthMode} />
      }

      <Footer />

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddCart={() => setCartCount(c=>c+1)} />}

      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSuccess={handleAuthSuccess} showToast={showToast} />}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
