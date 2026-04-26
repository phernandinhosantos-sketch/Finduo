import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://winfxmdkqjpwpgthuhgt.supabase.co";
const SUPABASE_KEY = "sb_publishable_nOFyGui_zLkBI7bm3SI8Gg_gwiazc50";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "food",      name: "Alimentação", emoji: "🍔", color: "#ff9f43", type: "both" },
  { id: "home",      name: "Casa",        emoji: "🏠", color: "#54a0ff", type: "expense" },
  { id: "transport", name: "Transporte",  emoji: "🚗", color: "#a29bfe", type: "expense" },
  { id: "health",    name: "Saúde",       emoji: "💊", color: "#00d2d3", type: "expense" },
  { id: "leisure",   name: "Lazer",       emoji: "🎮", color: "#ff6b9d", type: "expense" },
  { id: "clothes",   name: "Roupas",      emoji: "👕", color: "#fd79a8", type: "expense" },
  { id: "market",    name: "Mercado",     emoji: "🛒", color: "#55efc4", type: "expense" },
  { id: "edu",       name: "Educação",    emoji: "📚", color: "#fdcb6e", type: "expense" },
  { id: "pet",       name: "Pet",         emoji: "🐾", color: "#e17055", type: "expense" },
  { id: "salary",    name: "Salário",     emoji: "💰", color: "#00e5a0", type: "income" },
  { id: "freelance", name: "Freelance",   emoji: "💻", color: "#74b9ff", type: "income" },
  { id: "other",     name: "Outros",      emoji: "📦", color: "#636e72", type: "both" },
];

const CREDIT_CARDS_DEFAULT = [
  { id: "cc1", name: "Nubank",  limit: 8000, closingDay: 3,  dueDay: 10, color: "#8b5cf6" },
  { id: "cc2", name: "Itaú",   limit: 5000, closingDay: 20, dueDay: 27, color: "#f59e0b" },
];

const MONTHS      = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const USER_COLORS = ["#00e5a0","#4d9fff","#f59e0b","#ff6b9d","#a29bfe"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n||0);
const fmtDate = iso => { const d=new Date(iso); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`; };
const getCat  = id => CATEGORIES.find(c=>c.id===id) || CATEGORIES[CATEGORIES.length-1];
const getCard = id => CREDIT_CARDS_DEFAULT.find(c=>c.id===id);
const genId   = () => Math.random().toString(36).slice(2,10);

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0a0a0f;--surface:#12121a;--surface2:#1a1a26;--surface3:#22223a;
    --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
    --text:#f0f0f8;--text2:#8888aa;
    --green:#00e5a0;--green-dim:rgba(0,229,160,0.12);
    --red:#ff4d6d;--red-dim:rgba(255,77,109,0.12);
    --blue:#4d9fff;--blue-dim:rgba(77,159,255,0.12);
    --yellow:#ffd166;--yellow-dim:rgba(255,209,102,0.12);
    --purple:#b794f4;
    --radius:16px;--radius-sm:10px;
    --font-d:'Syne',sans-serif;--font-b:'DM Sans',sans-serif;
    --shadow:0 4px 24px rgba(0,0,0,0.4);--shadow-lg:0 8px 48px rgba(0,0,0,0.6);
  }
  body{background:var(--bg);color:var(--text);font-family:var(--font-b);min-height:100vh;overflow-x:hidden}
  ::-webkit-scrollbar{width:4px;height:3px}
  ::-webkit-scrollbar-thumb{background:var(--surface3);border-radius:4px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pop{0%{transform:scale(0.92);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes rtPulse{0%{box-shadow:0 0 0 0 rgba(0,229,160,0.4)}70%{box-shadow:0 0 0 6px rgba(0,229,160,0)}100%{box-shadow:0 0 0 0 rgba(0,229,160,0)}}
  .fade-up{animation:fadeUp 0.4s ease both}
  .fade-in{animation:fadeIn 0.3s ease both}
  .pop{animation:pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both}
  .s1{animation-delay:.05s}.s2{animation-delay:.10s}.s3{animation-delay:.15s}.s4{animation-delay:.20s}.s5{animation-delay:.25s}
  .app{display:flex;height:100vh;overflow:hidden}
  /* sidebar */
  .sidebar{width:240px;min-width:240px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:24px 0;z-index:100}
  .logo{padding:0 20px 20px;border-bottom:1px solid var(--border);margin-bottom:12px}
  .logo-mark{font-family:var(--font-d);font-size:22px;font-weight:800;display:flex;align-items:center;gap:8px}
  .logo-icon{width:32px;height:32px;background:var(--green);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#000;font-weight:900}
  .logo-text span{color:var(--green)}
  .ws-badge{margin-top:10px;display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface2);border-radius:var(--radius-sm);font-size:12px;color:var(--text2)}
  .ws-avs{display:flex}
  .ws-av{width:20px;height:20px;border-radius:50%;font-size:9px;display:flex;align-items:center;justify-content:center;font-weight:700;border:1.5px solid var(--surface);margin-right:-6px}
  .nav-lbl{padding:12px 20px 4px;font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--text2);opacity:.6}
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 20px;cursor:pointer;color:var(--text2);font-size:14px;border-left:2px solid transparent;transition:all .15s}
  .nav-item:hover{background:var(--surface2);color:var(--text)}
  .nav-item.active{background:var(--green-dim);color:var(--green);border-left-color:var(--green);font-weight:500}
  .nav-icon{font-size:16px;width:20px;text-align:center}
  .nav-badge{margin-left:auto;background:var(--red);color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px}
  .sidebar-foot{margin-top:auto;padding:16px 20px;border-top:1px solid var(--border)}
  .user-pill{display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px;border-radius:var(--radius-sm);transition:background .15s}
  .user-pill:hover{background:var(--surface2)}
  .uav{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}
  /* main */
  .main{flex:1;overflow-y:auto;background:var(--bg)}
  .topbar{position:sticky;top:0;z-index:50;background:rgba(10,10,15,0.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:0 28px;height:60px;display:flex;align-items:center;justify-content:space-between}
  .topbar-title{font-family:var(--font-d);font-size:17px;font-weight:700}
  .topbar-actions{display:flex;align-items:center;gap:10px}
  .page{padding:28px;max-width:1200px}
  /* cards */
  .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px}
  .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;position:relative;overflow:hidden;transition:border-color .2s}
  .stat-card:hover{border-color:var(--border2)}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
  .stat-card.green::before{background:var(--green)}.stat-card.red::before{background:var(--red)}.stat-card.blue::before{background:var(--blue)}.stat-card.yellow::before{background:var(--yellow)}
  .stat-lbl{font-size:11px;font-weight:500;letter-spacing:.8px;text-transform:uppercase;color:var(--text2);margin-bottom:8px}
  .stat-val{font-family:var(--font-d);font-size:26px;font-weight:700;letter-spacing:-.5px}
  .stat-val.green{color:var(--green)}.stat-val.red{color:var(--red)}.stat-val.blue{color:var(--blue)}.stat-val.yellow{color:var(--yellow)}
  .stat-sub{font-size:12px;color:var(--text2);margin-top:4px}
  .stat-icon{position:absolute;right:16px;top:16px;font-size:20px;opacity:.3}
  /* grid */
  .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .g2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
  /* buttons */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 18px;border-radius:var(--radius-sm);font-family:var(--font-b);font-size:14px;font-weight:500;cursor:pointer;border:none;transition:all .15s}
  .btn-p{background:var(--green);color:#000;font-weight:600}
  .btn-p:hover{background:#00ccaa;transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,229,160,0.3)}
  .btn-p:disabled{opacity:.4;cursor:not-allowed;transform:none}
  .btn-g{background:transparent;color:var(--text2);border:1px solid var(--border2)}
  .btn-g:hover{background:var(--surface2);color:var(--text)}
  .btn-d{background:var(--red-dim);color:var(--red);border:1px solid rgba(255,77,109,.2)}
  .btn-d:hover{background:rgba(255,77,109,.2)}
  .btn-sm{padding:6px 12px;font-size:12px}
  .btn-lg{padding:14px 28px;font-size:15px;font-weight:600}
  .fab{position:fixed;right:28px;bottom:28px;width:52px;height:52px;border-radius:50%;background:var(--green);color:#000;font-size:24px;font-weight:700;cursor:pointer;border:none;box-shadow:0 4px 24px rgba(0,229,160,0.4);display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:200}
  .fab:hover{transform:scale(1.08) rotate(45deg);box-shadow:0 6px 32px rgba(0,229,160,0.5)}
  /* modal */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;animation:fadeIn .2s ease}
  .modal{background:var(--surface);border:1px solid var(--border2);border-radius:20px;padding:28px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:pop .3s ease both}
  .modal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
  .modal-title{font-family:var(--font-d);font-size:18px;font-weight:700}
  .modal-close{width:30px;height:30px;border-radius:50%;background:var(--surface2);border:none;color:var(--text2);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .modal-close:hover{background:var(--surface3);color:var(--text)}
  /* forms */
  .fg{margin-bottom:16px}
  .fl{display:block;font-size:12px;font-weight:500;color:var(--text2);margin-bottom:6px;letter-spacing:.5px}
  .fi{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text);font-family:var(--font-b);font-size:14px;transition:border-color .2s;outline:none}
  .fi:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(0,229,160,0.1)}
  .fi::placeholder{color:var(--text2);opacity:.5}
  .amt-wrap{position:relative;margin-bottom:20px}
  .amt-pre{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:20px;color:var(--text2);font-family:var(--font-d);font-weight:600}
  .amt-inp{width:100%;background:var(--surface2);border:2px solid var(--border2);border-radius:var(--radius);padding:16px 14px 16px 40px;color:var(--text);font-family:var(--font-d);font-size:28px;font-weight:700;outline:none;transition:border-color .2s}
  .amt-inp:focus{border-color:var(--green);box-shadow:0 0 0 4px rgba(0,229,160,0.1)}
  .type-tog{display:flex;background:var(--surface2);border-radius:var(--radius-sm);padding:4px;margin-bottom:20px;gap:4px}
  .type-btn{flex:1;padding:8px;border-radius:8px;border:none;font-family:var(--font-b);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--text2);background:transparent}
  .type-btn.ae{background:var(--red);color:#fff}
  .type-btn.ai{background:var(--green);color:#000}
  .cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .cat-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;border-radius:var(--radius-sm);background:var(--surface2);border:1.5px solid transparent;cursor:pointer;transition:all .15s;font-size:11px;color:var(--text2);text-align:center}
  .cat-btn:hover{background:var(--surface3);color:var(--text)}
  .cat-btn.sel{border-color:var(--green);background:var(--green-dim);color:var(--green)}
  .pay-grid{display:flex;gap:8px}
  .pay-btn{flex:1;padding:8px;border-radius:8px;background:var(--surface2);border:1.5px solid transparent;cursor:pointer;font-size:12px;font-weight:500;color:var(--text2);text-align:center;transition:all .15s}
  .pay-btn:hover{background:var(--surface3)}
  .pay-btn.sel{border-color:var(--blue);background:var(--blue-dim);color:var(--blue)}
  .fsel{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text);font-family:var(--font-b);font-size:14px;outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238888aa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;transition:border-color .2s}
  .fsel:focus{border-color:var(--green)}
  /* tx */
  .tx-list{display:flex;flex-direction:column;gap:2px}
  .tx-item{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--radius-sm);transition:background .15s;cursor:pointer}
  .tx-item:hover{background:var(--surface2)}
  .tx-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
  .tx-info{flex:1;min-width:0}
  .tx-desc{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tx-meta{font-size:11px;color:var(--text2);margin-top:1px}
  .tx-amt{font-family:var(--font-d);font-size:15px;font-weight:700;white-space:nowrap}
  .tx-amt.income{color:var(--green)}.tx-amt.expense{color:var(--red)}
  .tx-who{width:22px;height:22px;border-radius:50%;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  /* progress */
  .prog-bar{height:6px;background:var(--surface3);border-radius:99px;overflow:hidden;margin-top:8px}
  .prog-fill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(0.34,1.56,0.64,1)}
  /* misc */
  .sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
  .sec-title{font-family:var(--font-d);font-size:15px;font-weight:700}
  .month-nav{display:flex;align-items:center;gap:12px}
  .month-nav button{background:var(--surface2);border:1px solid var(--border2);color:var(--text2);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .month-nav button:hover{background:var(--surface3);color:var(--text)}
  .month-nav span{font-size:14px;font-weight:500;min-width:100px;text-align:center}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600}
  .badge.green{background:var(--green-dim);color:var(--green)}.badge.red{background:var(--red-dim);color:var(--red)}.badge.blue{background:var(--blue-dim);color:var(--blue)}.badge.yellow{background:var(--yellow-dim);color:var(--yellow)}
  .alert{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:var(--radius-sm);font-size:13px;margin-bottom:8px}
  .alert.warn{background:var(--yellow-dim);border:1px solid rgba(255,209,102,.2);color:var(--yellow)}
  .alert.danger{background:var(--red-dim);border:1px solid rgba(255,77,109,.2);color:var(--red)}
  .alert.info{background:var(--blue-dim);border:1px solid rgba(77,159,255,.2);color:var(--blue)}
  .alert.success{background:var(--green-dim);border:1px solid rgba(0,229,160,.2);color:var(--green)}
  .chip{display:inline-flex;align-items:center;background:var(--surface2);border:1px solid var(--border2);border-radius:20px;padding:4px 12px;font-size:12px;color:var(--text2);cursor:pointer;transition:all .15s;gap:4px}
  .chip:hover,.chip.active{background:var(--green-dim);border-color:var(--green);color:var(--green)}
  .divider{height:1px;background:var(--border);margin:16px 0}
  .empty{text-align:center;padding:48px 24px;color:var(--text2)}
  .empty-icon{font-size:40px;margin-bottom:12px;opacity:.5}
  .empty-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px}
  .rt-dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 0 rgba(0,229,160,0.4);animation:rtPulse 2s infinite}
  .bar-chart{display:flex;align-items:flex-end;gap:10px;height:80px}
  .bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
  .bar{width:100%;border-radius:4px 4px 0 0;transition:height .5s cubic-bezier(0.34,1.56,0.64,1);min-height:2px}
  .bar-lbl{font-size:10px;color:var(--text2)}
  .cc-vis{background:linear-gradient(135deg,#1a1a3a 0%,#2d2d60 100%);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px;position:relative;overflow:hidden}
  .cc-vis::before{content:'';position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.04)}
  .goal-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px;transition:border-color .2s}
  .goal-card:hover{border-color:var(--border2)}
  .spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,.1);border-top-color:var(--green);border-radius:50%;animation:spin .7s linear infinite}
  .tabs{display:flex;border-bottom:1px solid var(--border);gap:4px;margin-bottom:20px}
  .tab{padding:10px 16px;font-size:13px;font-weight:500;color:var(--text2);cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;margin-bottom:-1px}
  .tab:hover{color:var(--text)}.tab.active{color:var(--green);border-bottom-color:var(--green)}
  /* toast */
  .toast-wrap{position:fixed;bottom:90px;right:28px;display:flex;flex-direction:column;gap:8px;z-index:2000}
  .toast{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:12px 16px;font-size:13px;box-shadow:var(--shadow);display:flex;align-items:center;gap:8px;animation:fadeIn .3s ease;max-width:280px}
  /* auth */
  .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg)}
  .auth-box{background:var(--surface);border:1px solid var(--border2);border-radius:24px;padding:36px;width:100%;max-width:400px;box-shadow:var(--shadow-lg)}
  /* loading */
  .loading-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:var(--bg)}
  /* onboarding */
  .ob-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg)}
  .ob-box{background:var(--surface);border:1px solid var(--border2);border-radius:24px;padding:36px;width:100%;max-width:460px}
  .ob-step{display:flex;align-items:center;gap:8px;margin-bottom:24px}
  .ob-dot{width:8px;height:8px;border-radius:50%;background:var(--surface3)}
  .ob-dot.active{background:var(--green)}
  /* invite */
  .inv-code{font-family:var(--font-d);font-size:28px;font-weight:800;letter-spacing:6px;color:var(--green);text-align:center;padding:16px;background:var(--green-dim);border-radius:var(--radius);border:1px solid rgba(0,229,160,.2);margin:16px 0}
  @media(max-width:768px){
    .sidebar{display:none}
    .g4{grid-template-columns:repeat(2,1fr)}
    .g3{grid-template-columns:1fr}
    .page{padding:16px}
    .topbar{padding:0 16px}
  }
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span>{t.type==="success"?"✅":"❌"}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handle() {
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setDone(true);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) return (
    <div className="auth-wrap">
      <div className="auth-box" style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
        <h2 style={{ fontFamily:"var(--font-d)", fontSize:22, fontWeight:800, marginBottom:8 }}>Confirme seu e-mail</h2>
        <p style={{ color:"var(--text2)", fontSize:14 }}>Enviamos um link de confirmação para <strong style={{ color:"var(--text)" }}>{email}</strong>. Acesse seu e-mail e clique no link para ativar sua conta.</p>
        <button className="btn btn-g" style={{ marginTop:20 }} onClick={() => { setDone(false); setMode("login"); }}>← Voltar ao login</button>
      </div>
    </div>
  );

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:8 }}>
            <div className="logo-icon">F</div>
            <span style={{ fontFamily:"var(--font-d)", fontSize:24, fontWeight:800 }}>Fin<span style={{ color:"var(--green)" }}>Duo</span></span>
          </div>
          <p style={{ color:"var(--text2)", fontSize:13 }}>Controle financeiro para casais</p>
        </div>

        <div className="tabs" style={{ marginBottom:24 }}>
          <div className={`tab ${mode==="login"?"active":""}`} onClick={() => { setMode("login"); setError(""); }}>Entrar</div>
          <div className={`tab ${mode==="signup"?"active":""}`} onClick={() => { setMode("signup"); setError(""); }}>Criar conta</div>
        </div>

        {error && <div className="alert danger" style={{ marginBottom:16 }}>⚠️ {error}</div>}

        <div className="fg">
          <label className="fl">E-mail</label>
          <input className="fi" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handle()} />
        </div>
        <div className="fg">
          <label className="fl">Senha</label>
          <input className="fi" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handle()} />
        </div>

        <button className="btn btn-p btn-lg" style={{ width:"100%", marginTop:8 }} onClick={handle} disabled={loading||!email||!password}>
          {loading ? <div className="spinner" /> : mode==="login" ? "Entrar →" : "Criar conta →"}
        </button>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ user, onDone }) {
  const [step, setStep] = useState(1); // 1=create or join, 2=create, 3=join, 4=done
  const [wsName, setWsName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createWorkspace() {
    if (!wsName || !displayName) return;
    setLoading(true); setError("");
    try {
      const { data: ws, error: e1 } = await supabase.from("workspaces").insert({ name: wsName }).select().single();
      if (e1) throw e1;
      const color = USER_COLORS[0];
      const { error: e2 } = await supabase.from("workspace_members").insert({
        workspace_id: ws.id, user_id: user.id, display_name: displayName, color, role: "owner"
      });
      if (e2) throw e2;
      setInviteCode(ws.invite_code);
      setStep(4);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function joinWorkspace() {
    if (!joinCode || !displayName) return;
    setLoading(true); setError("");
    try {
      const { data: ws, error: e1 } = await supabase.from("workspaces").select("*").eq("invite_code", joinCode.trim()).single();
      if (e1 || !ws) throw new Error("Código inválido. Verifique e tente novamente.");
      const color = USER_COLORS[1];
      const { error: e2 } = await supabase.from("workspace_members").insert({
        workspace_id: ws.id, user_id: user.id, display_name: displayName, color, role: "member"
      });
      if (e2) throw e2;
      onDone();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="ob-wrap">
      <div className="ob-box">
        <div style={{ display:"flex", gap:6, marginBottom:24 }}>
          {[1,2,3].map(i => <div key={i} className={`ob-dot ${step>=i?"active":""}`} />)}
        </div>

        {step === 1 && (
          <div className="fade-up">
            <h2 style={{ fontFamily:"var(--font-d)", fontSize:24, fontWeight:800, marginBottom:8 }}>Bem-vindo ao FinDuo 👋</h2>
            <p style={{ color:"var(--text2)", fontSize:14, marginBottom:28 }}>Você quer criar um novo espaço compartilhado ou entrar no espaço do seu parceiro?</p>
            <div className="g2" style={{ gap:12 }}>
              <button className="btn btn-p" style={{ padding:"20px 12px", flexDirection:"column", gap:8, height:"auto" }} onClick={() => setStep(2)}>
                <span style={{ fontSize:28 }}>✨</span>
                <div><div style={{ fontWeight:700 }}>Criar espaço</div><div style={{ fontSize:11, opacity:.7, fontWeight:400 }}>Novo casal</div></div>
              </button>
              <button className="btn btn-g" style={{ padding:"20px 12px", flexDirection:"column", gap:8, height:"auto" }} onClick={() => setStep(3)}>
                <span style={{ fontSize:28 }}>🔗</span>
                <div><div style={{ fontWeight:700 }}>Entrar</div><div style={{ fontSize:11, opacity:.7, fontWeight:400 }}>Tenho um código</div></div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up">
            <h2 style={{ fontFamily:"var(--font-d)", fontSize:22, fontWeight:800, marginBottom:8 }}>Criar espaço do casal</h2>
            <p style={{ color:"var(--text2)", fontSize:14, marginBottom:24 }}>Configure seu espaço compartilhado.</p>
            {error && <div className="alert danger" style={{ marginBottom:16 }}>⚠️ {error}</div>}
            <div className="fg">
              <label className="fl">Seu nome</label>
              <input className="fi" placeholder="Ex: Ana" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="fg">
              <label className="fl">Nome do espaço</label>
              <input className="fi" placeholder="Ex: Casal Silva" value={wsName} onChange={e => setWsName(e.target.value)} />
            </div>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button className="btn btn-g" onClick={() => setStep(1)}>← Voltar</button>
              <button className="btn btn-p" style={{ flex:1 }} onClick={createWorkspace} disabled={loading||!wsName||!displayName}>
                {loading ? <div className="spinner" /> : "Criar espaço →"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up">
            <h2 style={{ fontFamily:"var(--font-d)", fontSize:22, fontWeight:800, marginBottom:8 }}>Entrar no espaço</h2>
            <p style={{ color:"var(--text2)", fontSize:14, marginBottom:24 }}>Peça o código de convite para seu parceiro.</p>
            {error && <div className="alert danger" style={{ marginBottom:16 }}>⚠️ {error}</div>}
            <div className="fg">
              <label className="fl">Seu nome</label>
              <input className="fi" placeholder="Ex: João" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="fg">
              <label className="fl">Código de convite</label>
              <input className="fi" placeholder="ex: a1b2c3d4" value={joinCode} onChange={e => setJoinCode(e.target.value)} style={{ letterSpacing:3, fontSize:16 }} />
            </div>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button className="btn btn-g" onClick={() => setStep(1)}>← Voltar</button>
              <button className="btn btn-p" style={{ flex:1 }} onClick={joinWorkspace} disabled={loading||!joinCode||!displayName}>
                {loading ? <div className="spinner" /> : "Entrar →"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-up" style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
            <h2 style={{ fontFamily:"var(--font-d)", fontSize:22, fontWeight:800, marginBottom:8 }}>Espaço criado!</h2>
            <p style={{ color:"var(--text2)", fontSize:14, marginBottom:4 }}>Compartilhe este código com seu parceiro para ele entrar:</p>
            <div className="inv-code">{inviteCode}</div>
            <p style={{ color:"var(--text2)", fontSize:12, marginBottom:20 }}>Ele vai criar uma conta e usar esse código para entrar no seu espaço.</p>
            <button className="btn btn-p btn-lg" onClick={onDone}>Começar a usar →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TX ITEM ──────────────────────────────────────────────────────────────────
function TxItem({ tx, members, onClick }) {
  const cat  = getCat(tx.category_id);
  const card = tx.credit_card_id ? getCard(tx.credit_card_id) : null;
  const member = members.find(m => m.user_id === tx.user_id);
  return (
    <div className="tx-item" onClick={() => onClick && onClick(tx)}>
      <div className="tx-ico" style={{ background: cat.color + "20" }}>{cat.emoji}</div>
      <div className="tx-info">
        <div className="tx-desc">{tx.description || cat.name}</div>
        <div className="tx-meta">
          {cat.name} · {fmtDate(tx.date)} ·{" "}
          {tx.payment_method==="credit" && card ? `💳 ${card.name}` : tx.payment_method==="debit" ? "🏦 Débito" : "💵 Dinheiro"}
        </div>
      </div>
      {member && (
        <div className="tx-who" style={{ background: member.color+"30", color: member.color }}>
          {member.display_name[0]}
        </div>
      )}
      <div className={`tx-amt ${tx.type}`}>
        {tx.type==="income"?"+":"−"}{fmt(tx.amount)}
      </div>
    </div>
  );
}

// ─── NEW TX MODAL ─────────────────────────────────────────────────────────────
function NewTxModal({ onClose, onSave }) {
  const [type, setType]   = useState("expense");
  const [amount, setAmount] = useState("");
  const [desc, setDesc]   = useState("");
  const [catId, setCatId] = useState("");
  const [pay, setPay]     = useState("debit");
  const [cardId, setCardId] = useState("cc1");
  const [date, setDate]   = useState(new Date().toISOString().slice(0,10));
  const [saving, setSaving] = useState(false);

  const visibleCats = CATEGORIES.filter(c => c.type==="both" || c.type===type);

  async function handleSave() {
    if (!amount || !catId) return;
    setSaving(true);
    await onSave({
      type, amount: parseFloat(amount),
      description: desc || getCat(catId).name,
      category_id: catId, payment_method: pay,
      credit_card_id: pay==="credit" ? cardId : null,
      date,
    });
    setSaving(false);
  }

  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <div className="modal-title">Nova Transação</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="type-tog">
          <button className={`type-btn ${type==="expense"?"ae":""}`} onClick={() => { setType("expense"); setCatId(""); }}>↓ Despesa</button>
          <button className={`type-btn ${type==="income"?"ai":""}`}  onClick={() => { setType("income");  setCatId(""); }}>↑ Receita</button>
        </div>

        <div className="amt-wrap">
          <span className="amt-pre">R$</span>
          <input className="amt-inp" type="number" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
        </div>

        <div className="fg">
          <label className="fl">Descrição (opcional)</label>
          <input className="fi" placeholder="Ex: Almoço" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>

        <div className="fg">
          <label className="fl">Categoria</label>
          <div className="cat-grid">
            {visibleCats.map(c => (
              <button key={c.id} className={`cat-btn ${catId===c.id?"sel":""}`} onClick={() => setCatId(c.id)}>
                <span style={{ fontSize:20 }}>{c.emoji}</span>{c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="fg">
          <label className="fl">Forma de pagamento</label>
          <div className="pay-grid">
            {[{id:"debit",l:"🏦 Débito"},{id:"credit",l:"💳 Crédito"},{id:"cash",l:"💵 Dinheiro"}].map(p => (
              <button key={p.id} className={`pay-btn ${pay===p.id?"sel":""}`} onClick={() => setPay(p.id)}>{p.l}</button>
            ))}
          </div>
        </div>

        {pay==="credit" && (
          <div className="fg fade-in">
            <label className="fl">Cartão</label>
            <select className="fsel" value={cardId} onChange={e => setCardId(e.target.value)}>
              {CREDIT_CARDS_DEFAULT.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div className="fg">
          <label className="fl">Data</label>
          <input className="fi" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <button className="btn btn-p btn-lg" style={{ width:"100%" }} onClick={handleSave} disabled={saving||!amount||!catId}>
          {saving ? <div className="spinner" /> : "💾 Salvar"}
        </button>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function SC({ label, value, color, icon, sub }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-lbl">{label}</div>
      <div className={`stat-val ${color}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ txs, goals, members, currentMonth, onMonthChange }) {
  const [y, m] = currentMonth;
  const mTxs = txs.filter(t => { const d=new Date(t.date+"T12:00"); return d.getFullYear()===y && d.getMonth()===m; });

  const inc  = mTxs.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const exp  = mTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
  const bal  = inc - exp;
  const savR = inc>0 ? Math.round(bal/inc*100) : 0;

  const byCat = {};
  mTxs.filter(t=>t.type==="expense").forEach(t => { byCat[t.category_id]=(byCat[t.category_id]||0)+Number(t.amount); });
  const catList = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);

  const barData = Array.from({length:6},(_,i) => {
    const mi = ((m-5+i)+12)%12;
    const yi = m-5+i<0?y-1:y;
    const bd = txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===yi&&d.getMonth()===mi; });
    return { label:MONTHS[mi], inc:bd.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0), exp:bd.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0) };
  });
  const maxBar = Math.max(...barData.map(b=>Math.max(b.inc,b.exp)),1);

  const cardUsage = CREDIT_CARDS_DEFAULT.map(c => ({
    ...c, used: mTxs.filter(t=>t.credit_card_id===c.id).reduce((s,t)=>s+Number(t.amount),0)
  }));

  const recent = [...mTxs].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);

  const alerts = [];
  if(bal<0) alerts.push({type:"danger",msg:"⚠️ Gastos superiores às receitas este mês!"});
  cardUsage.forEach(c => { if(c.used/c.limit>0.8) alerts.push({type:"warn",msg:`💳 ${c.name} está a ${Math.round(c.used/c.limit*100)}% do limite`}); });
  if(savR<10&&inc>0) alerts.push({type:"info",msg:"💡 Taxa de poupança abaixo de 10%."});

  return (
    <div className="page">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800,letterSpacing:"-.5px" }}>Dashboard</h1>
          <p style={{ color:"var(--text2)",fontSize:13,marginTop:2 }}>Visão completa do casal</p>
        </div>
        <div className="month-nav">
          <button onClick={()=>onMonthChange(-1)}>‹</button>
          <span>{MONTH_NAMES[m]} {y}</span>
          <button onClick={()=>onMonthChange(1)}>›</button>
        </div>
      </div>

      {alerts.map((a,i) => <div key={i} className={`alert ${a.type}`}>{a.msg}</div>)}

      <div className="g4 fade-up" style={{ marginBottom:20 }}>
        <SC label="Saldo do Mês" value={fmt(bal)} color={bal>=0?"green":"red"} icon="💰" sub={`Poupança: ${savR}%`} />
        <SC label="Receitas" value={fmt(inc)} color="green" icon="↑" sub={`${mTxs.filter(t=>t.type==="income").length} lançamentos`} />
        <SC label="Despesas" value={fmt(exp)} color="red" icon="↓" sub={`${mTxs.filter(t=>t.type==="expense").length} lançamentos`} />
        <SC label="No crédito" value={fmt(cardUsage.reduce((s,c)=>s+c.used,0))} color="blue" icon="💳" />
      </div>

      <div className="g3" style={{ marginBottom:20 }}>
        <div className="card s1 fade-up" style={{ gridColumn:"span 2" }}>
          <div className="sec-hd">
            <div className="sec-title">Evolução Mensal</div>
            <div style={{ display:"flex",gap:12,fontSize:12 }}>
              <span style={{ color:"var(--green)" }}>● Receitas</span>
              <span style={{ color:"var(--red)" }}>● Despesas</span>
            </div>
          </div>
          <div className="bar-chart">
            {barData.map((b,i) => (
              <div key={i} className="bar-col">
                <div style={{ position:"relative",display:"flex",alignItems:"flex-end",gap:3,height:72 }}>
                  <div className="bar" style={{ background:"var(--green)",opacity:.8,height:`${(b.inc/maxBar)*100}%`,width:"40%" }} />
                  <div className="bar" style={{ background:"var(--red)",opacity:.8,height:`${(b.exp/maxBar)*100}%`,width:"40%" }} />
                </div>
                <div className="bar-lbl">{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card s2 fade-up">
          <div className="sec-title" style={{ marginBottom:16 }}>Por Categoria</div>
          {catList.length===0 ? <div style={{ color:"var(--text2)",fontSize:13,textAlign:"center",padding:"24px 0" }}>Sem gastos</div> :
            catList.slice(0,5).map(([cId,val]) => {
              const cat=getCat(cId); const pct=exp>0?(val/exp)*100:0;
              return (
                <div key={cId} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4 }}>
                    <span>{cat.emoji} {cat.name}</span>
                    <span style={{ color:"var(--text2)" }}>{fmt(val)}</span>
                  </div>
                  <div className="prog-bar"><div className="prog-fill" style={{ width:`${pct}%`,background:cat.color }} /></div>
                </div>
              );
            })
          }
        </div>
      </div>

      <div className="g2" style={{ marginBottom:20 }}>
        <div className="card s3 fade-up">
          <div className="sec-hd"><div className="sec-title">Cartões</div></div>
          {cardUsage.map(c => {
            const pct=Math.min((c.used/c.limit)*100,100);
            return (
              <div key={c.id} style={{ marginBottom:16 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                  <span style={{ fontSize:14,fontWeight:500 }}>💳 {c.name}</span>
                  <span className={`badge ${pct>80?"red":pct>50?"yellow":"green"}`}>{Math.round(pct)}%</span>
                </div>
                <div style={{ fontSize:12,color:"var(--text2)",marginBottom:6 }}>{fmt(c.used)} / {fmt(c.limit)}</div>
                <div className="prog-bar"><div className="prog-fill" style={{ width:`${pct}%`,background:pct>80?"var(--red)":pct>50?"var(--yellow)":"var(--green)" }} /></div>
              </div>
            );
          })}
        </div>

        <div className="card s4 fade-up">
          <div className="sec-hd"><div className="sec-title">Metas</div></div>
          {goals.slice(0,3).map(g => {
            const pct=Math.min((g.current/g.target)*100,100);
            return (
              <div key={g.id} style={{ marginBottom:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4 }}>
                  <span>{g.emoji} {g.name}</span>
                  <span style={{ color:"var(--text2)" }}>{Math.round(pct)}%</span>
                </div>
                <div className="prog-bar"><div className="prog-fill" style={{ width:`${pct}%`,background:pct>=100?"var(--green)":"var(--blue)" }} /></div>
                <div style={{ fontSize:11,color:"var(--text2)",marginTop:4 }}>{fmt(g.current)} de {fmt(g.target)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card s5 fade-up">
        <div className="sec-hd"><div className="sec-title">Últimas Transações</div></div>
        {recent.length===0 ? (
          <div className="empty"><div className="empty-icon">📭</div><div className="empty-title">Sem transações</div></div>
        ) : (
          <div className="tx-list">{recent.map(tx => <TxItem key={tx.id} tx={tx} members={members} />)}</div>
        )}
      </div>
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
function Transactions({ txs, members, onDelete, currentMonth, onMonthChange }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [y, m] = currentMonth;

  const mTxs = txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
  const inc  = mTxs.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const exp  = mTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);

  const filtered = mTxs.filter(t => {
    if(filter==="income"&&t.type!=="income") return false;
    if(filter==="expense"&&t.type!=="expense") return false;
    if(filter==="credit"&&t.payment_method!=="credit") return false;
    if(search&&!(t.description||"").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));

  return (
    <div className="page">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800 }}>Transações</h1>
          <p style={{ color:"var(--text2)",fontSize:13 }}>{MONTH_NAMES[m]} {y}</p>
        </div>
        <div className="month-nav">
          <button onClick={()=>onMonthChange(-1)}>‹</button>
          <span>{MONTHS[m]}/{y}</span>
          <button onClick={()=>onMonthChange(1)}>›</button>
        </div>
      </div>

      <div className="g3 fade-up" style={{ marginBottom:20 }}>
        <SC label="Receitas" value={fmt(inc)} color="green" icon="↑" />
        <SC label="Despesas" value={fmt(exp)} color="red" icon="↓" />
        <SC label="Saldo" value={fmt(inc-exp)} color={inc-exp>=0?"green":"red"} icon="💰" />
      </div>

      <div className="card fade-up s1">
        <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap" }}>
          {["all","income","expense","credit"].map(f => (
            <button key={f} className={`chip ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
              {f==="all"?"Todos":f==="income"?"Receitas":f==="expense"?"Despesas":"Crédito"}
            </button>
          ))}
          <input className="fi" style={{ marginLeft:"auto",width:"auto",flex:1,maxWidth:200,padding:"6px 12px",fontSize:13 }}
            placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {filtered.length===0 ? (
          <div className="empty"><div className="empty-icon">🔍</div><div className="empty-title">Nenhuma transação</div></div>
        ) : (
          <div className="tx-list">{filtered.map(tx=><TxItem key={tx.id} tx={tx} members={members} onClick={setSel} />)}</div>
        )}
      </div>

      {sel && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setSel(null)}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">Detalhes</div>
              <button className="modal-close" onClick={()=>setSel(null)}>✕</button>
            </div>
            {(() => {
              const cat=getCat(sel.category_id);
              const member=members.find(m=>m.user_id===sel.user_id);
              const card=sel.credit_card_id?getCard(sel.credit_card_id):null;
              return (
                <div>
                  <div style={{ textAlign:"center",padding:"16px 0 24px" }}>
                    <div style={{ fontSize:40,marginBottom:8 }}>{cat.emoji}</div>
                    <div className={`stat-val ${sel.type}`} style={{ fontSize:32,fontFamily:"var(--font-d)" }}>
                      {sel.type==="income"?"+":"−"}{fmt(sel.amount)}
                    </div>
                    <div style={{ color:"var(--text2)",marginTop:4 }}>{sel.description||cat.name}</div>
                  </div>
                  <div className="divider" />
                  {[
                    ["Categoria",`${cat.emoji} ${cat.name}`],
                    ["Data",fmtDate(sel.date)],
                    ["Pagamento",sel.payment_method==="credit"?"💳 Crédito":sel.payment_method==="debit"?"🏦 Débito":"💵 Dinheiro"],
                    card?["Cartão",card.name]:null,
                    member?["Lançado por",member.display_name]:null,
                  ].filter(Boolean).map(([k,v])=>(
                    <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)",fontSize:14 }}>
                      <span style={{ color:"var(--text2)" }}>{k}</span>
                      <span style={{ fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                  <button className="btn btn-d" style={{ width:"100%",marginTop:20 }} onClick={()=>{ onDelete(sel.id); setSel(null); }}>
                    🗑️ Excluir
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CARTÕES ──────────────────────────────────────────────────────────────────
function Cards({ txs, members, currentMonth }) {
  const [y, m] = currentMonth;
  const mTxs = txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
  return (
    <div className="page">
      <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800,marginBottom:6 }}>Cartões de Crédito</h1>
      <p style={{ color:"var(--text2)",fontSize:13,marginBottom:24 }}>{MONTH_NAMES[m]} {y}</p>
      <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
        {CREDIT_CARDS_DEFAULT.map(card=>{
          const cTxs=mTxs.filter(t=>t.credit_card_id===card.id);
          const used=cTxs.reduce((s,t)=>s+Number(t.amount),0);
          const pct=Math.min((used/card.limit)*100,100);
          return (
            <div key={card.id} className="card fade-up">
              <div className="cc-vis" style={{ marginBottom:16 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                  <div style={{ fontSize:20,fontWeight:700,fontFamily:"var(--font-d)",color:card.color }}>{card.name}</div>
                  <span className={`badge ${pct>80?"red":pct>50?"yellow":"green"}`}>{Math.round(pct)}% usado</span>
                </div>
                <div style={{ fontFamily:"var(--font-d)",fontSize:26,fontWeight:700,marginBottom:10 }}>
                  {fmt(used)}<span style={{ fontSize:14,color:"rgba(255,255,255,.4)",fontWeight:400 }}> / {fmt(card.limit)}</span>
                </div>
                <div className="prog-bar" style={{ height:8 }}>
                  <div className="prog-fill" style={{ width:`${pct}%`,background:pct>80?"var(--red)":pct>50?"var(--yellow)":"var(--green)" }} />
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",marginTop:10,fontSize:12,color:"rgba(255,255,255,.5)" }}>
                  <span>Fecha dia {card.closingDay}</span><span>Vence dia {card.dueDay}</span><span>Disponível: {fmt(card.limit-used)}</span>
                </div>
              </div>
              <div className="sec-hd">
                <div className="sec-title">Transações do mês</div>
                <span className="badge blue">{cTxs.length}</span>
              </div>
              {cTxs.length===0 ? (
                <div className="empty" style={{ padding:24 }}><div className="empty-icon">💳</div><div style={{ fontSize:13,color:"var(--text2)" }}>Sem gastos</div></div>
              ) : (
                <div className="tx-list">{[...cTxs].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(tx=><TxItem key={tx.id} tx={tx} members={members} />)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── METAS ────────────────────────────────────────────────────────────────────
function Goals({ goals, workspaceId, onRefresh }) {
  const [showNew, setShowNew] = useState(false);
  const [aportGoal, setAportGoal] = useState(null);
  const [aportAmt, setAportAmt] = useState("");
  const [newG, setNewG] = useState({ name:"", emoji:"🎯", target:"", current:"0", deadline:"" });
  const [saving, setSaving] = useState(false);

  const emojis = ["🎯","✈️","🏠","🚗","💻","📱","🛡️","💍","🎓","🏖️","💪","🎮"];

  async function createGoal() {
    if(!newG.name||!newG.target) return;
    setSaving(true);
    await supabase.from("goals").insert({ workspace_id:workspaceId, name:newG.name, emoji:newG.emoji, target:+newG.target, current:+newG.current, deadline:newG.deadline||null });
    await onRefresh();
    setShowNew(false);
    setSaving(false);
  }

  async function aport(g) {
    if(!aportAmt) return;
    const newVal = Math.min(g.current+parseFloat(aportAmt), g.target);
    await supabase.from("goals").update({ current:newVal }).eq("id",g.id);
    await onRefresh();
    setAportGoal(null);
  }

  return (
    <div className="page">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800 }}>Metas</h1>
          <p style={{ color:"var(--text2)",fontSize:13 }}>{goals.filter(g=>g.current>=g.target).length} de {goals.length} concluídas</p>
        </div>
        <button className="btn btn-p" onClick={()=>setShowNew(true)}>+ Nova meta</button>
      </div>

      <div className="g2">
        {goals.map((g,i)=>{
          const pct=Math.min((g.current/g.target)*100,100);
          const done=g.current>=g.target;
          const dl=g.deadline?new Date(g.deadline):null;
          const days=dl?Math.ceil((dl-new Date())/(864e5)):null;
          return (
            <div key={g.id} className={`goal-card fade-up s${i%5+1}`}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:done?"var(--green-dim)":"var(--surface2)",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center" }}>{g.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600 }}>{g.name}</div>
                  {dl&&<div style={{ fontSize:12,color:days<30?"var(--red)":"var(--text2)" }}>{done?"✅ Concluída!":days>0?`${days} dias restantes`:"Prazo encerrado"}</div>}
                </div>
                {done&&<span className="badge green">✓</span>}
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6 }}>
                <span style={{ fontFamily:"var(--font-d)",fontWeight:700,color:"var(--green)" }}>{fmt(g.current)}</span>
                <span style={{ color:"var(--text2)" }}>de {fmt(g.target)}</span>
              </div>
              <div className="prog-bar" style={{ height:8,marginBottom:12 }}>
                <div className="prog-fill" style={{ width:`${pct}%`,background:done?"var(--green)":pct>60?"var(--blue)":"var(--purple)" }} />
              </div>
              {!done&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:12,color:"var(--text2)" }}>Faltam {fmt(g.target-g.current)}</span>
                <button className="btn btn-g btn-sm" onClick={()=>{ setAportGoal(g); setAportAmt(""); }}>+ Aportar</button>
              </div>}
            </div>
          );
        })}
      </div>

      {goals.length===0&&<div className="empty"><div className="empty-icon">🎯</div><div className="empty-title">Nenhuma meta</div><div style={{ fontSize:13 }}>Defina objetivos financeiros para o casal</div></div>}

      {showNew&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowNew(false)}>
          <div className="modal">
            <div className="modal-hd"><div className="modal-title">Nova Meta</div><button className="modal-close" onClick={()=>setShowNew(false)}>✕</button></div>
            <div className="fg">
              <label className="fl">Ícone</label>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {emojis.map(e=>(
                  <button key={e} onClick={()=>setNewG(g=>({...g,emoji:e}))} style={{ width:36,height:36,borderRadius:8,fontSize:18,cursor:"pointer",background:newG.emoji===e?"var(--green-dim)":"var(--surface2)",border:newG.emoji===e?"1.5px solid var(--green)":"1.5px solid transparent",display:"flex",alignItems:"center",justifyContent:"center" }}>{e}</button>
                ))}
              </div>
            </div>
            <div className="fg"><label className="fl">Nome</label><input className="fi" placeholder="Ex: Viagem para Europa" value={newG.name} onChange={e=>setNewG(g=>({...g,name:e.target.value}))} /></div>
            <div className="g2" style={{ gap:12,marginBottom:16 }}>
              <div><label className="fl">Valor alvo</label><input className="fi" type="number" placeholder="0" value={newG.target} onChange={e=>setNewG(g=>({...g,target:e.target.value}))} /></div>
              <div><label className="fl">Já guardado</label><input className="fi" type="number" placeholder="0" value={newG.current} onChange={e=>setNewG(g=>({...g,current:e.target.value}))} /></div>
            </div>
            <div className="fg"><label className="fl">Prazo</label><input className="fi" type="date" value={newG.deadline} onChange={e=>setNewG(g=>({...g,deadline:e.target.value}))} /></div>
            <button className="btn btn-p btn-lg" style={{ width:"100%" }} onClick={createGoal} disabled={saving||!newG.name||!newG.target}>
              {saving?<div className="spinner"/>:"🎯 Criar meta"}
            </button>
          </div>
        </div>
      )}

      {aportGoal&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setAportGoal(null)}>
          <div className="modal">
            <div className="modal-hd"><div className="modal-title">Aportar em {aportGoal.emoji} {aportGoal.name}</div><button className="modal-close" onClick={()=>setAportGoal(null)}>✕</button></div>
            <div style={{ fontSize:13,color:"var(--text2)",marginBottom:12 }}>{fmt(aportGoal.current)} / {fmt(aportGoal.target)}</div>
            <div className="amt-wrap"><span className="amt-pre">R$</span><input className="amt-inp" type="number" placeholder="0,00" value={aportAmt} onChange={e=>setAportAmt(e.target.value)} autoFocus /></div>
            <button className="btn btn-p btn-lg" style={{ width:"100%" }} onClick={()=>aport(aportGoal)} disabled={!aportAmt}>💰 Confirmar aporte</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
function Reports({ txs, members }) {
  const now = new Date();
  const months = Array.from({length:6},(_,i)=>{ const d=new Date(now.getFullYear(),now.getMonth()-i,1); return {y:d.getFullYear(),m:d.getMonth()}; }).reverse();

  const byCat = {};
  txs.filter(t=>t.type==="expense").forEach(t=>{ byCat[t.category_id]=(byCat[t.category_id]||0)+Number(t.amount); });
  const totalExp = Object.values(byCat).reduce((s,v)=>s+v,0);

  return (
    <div className="page">
      <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800,marginBottom:6 }}>Relatórios</h1>
      <p style={{ color:"var(--text2)",fontSize:13,marginBottom:24 }}>Últimos 6 meses</p>

      <div className="card fade-up" style={{ marginBottom:20 }}>
        <div className="sec-title" style={{ marginBottom:16 }}>Gastos por Categoria (acumulado)</div>
        {Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([cId,val])=>{
          const cat=getCat(cId); const pct=totalExp>0?(val/totalExp)*100:0;
          return (
            <div key={cId} style={{ marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4 }}>
                <span>{cat.emoji} {cat.name}</span>
                <div style={{ display:"flex",gap:12 }}>
                  <span style={{ color:"var(--text2)" }}>{Math.round(pct)}%</span>
                  <span style={{ fontWeight:600 }}>{fmt(val)}</span>
                </div>
              </div>
              <div className="prog-bar"><div className="prog-fill" style={{ width:`${pct}%`,background:cat.color }} /></div>
            </div>
          );
        })}
      </div>

      <div className="card fade-up s1" style={{ marginBottom:20 }}>
        <div className="sec-title" style={{ marginBottom:16 }}>Resumo Mensal</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid var(--border)" }}>
                <th style={{ textAlign:"left",padding:"8px 12px",color:"var(--text2)",fontWeight:500 }}>Mês</th>
                <th style={{ textAlign:"right",padding:"8px 12px",color:"var(--green)",fontWeight:500 }}>Receitas</th>
                <th style={{ textAlign:"right",padding:"8px 12px",color:"var(--red)",fontWeight:500 }}>Despesas</th>
                <th style={{ textAlign:"right",padding:"8px 12px",fontWeight:500 }}>Saldo</th>
                <th style={{ textAlign:"right",padding:"8px 12px",color:"var(--text2)",fontWeight:500 }}>Poupança</th>
              </tr>
            </thead>
            <tbody>
              {months.map(({y,m})=>{
                const mTx=txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
                const i=mTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
                const e=mTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
                const b=i-e; const sv=i>0?Math.round(b/i*100):0;
                return (
                  <tr key={`${y}-${m}`} style={{ borderBottom:"1px solid var(--border)" }}>
                    <td style={{ padding:"10px 12px",fontWeight:500 }}>{MONTHS[m]}/{y}</td>
                    <td style={{ padding:"10px 12px",textAlign:"right",color:"var(--green)" }}>{fmt(i)}</td>
                    <td style={{ padding:"10px 12px",textAlign:"right",color:"var(--red)" }}>{fmt(e)}</td>
                    <td style={{ padding:"10px 12px",textAlign:"right",fontWeight:600,color:b>=0?"var(--green)":"var(--red)" }}>{fmt(b)}</td>
                    <td style={{ padding:"10px 12px",textAlign:"right" }}><span className={`badge ${sv>=20?"green":sv>=10?"yellow":"red"}`}>{sv}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card fade-up s2">
        <div className="sec-title" style={{ marginBottom:16 }}>Por Usuário</div>
        <div className="g2">
          {members.map(member=>{
            const uTx=txs.filter(t=>t.user_id===member.user_id);
            const i=uTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
            const e=uTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
            return (
              <div key={member.id} style={{ padding:16,background:"var(--surface2)",borderRadius:12 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                  <div style={{ width:36,height:36,borderRadius:"50%",background:member.color+"30",color:member.color,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>{member.display_name[0]}</div>
                  <div><div style={{ fontWeight:600 }}>{member.display_name}</div></div>
                </div>
                <div style={{ fontSize:13,display:"flex",flexDirection:"column",gap:6 }}>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ color:"var(--text2)" }}>Receitas</span><span style={{ color:"var(--green)" }}>{fmt(i)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ color:"var(--text2)" }}>Despesas</span><span style={{ color:"var(--red)" }}>{fmt(e)}</span></div>
                  <div className="divider" style={{ margin:"4px 0" }} />
                  <div style={{ display:"flex",justifyContent:"space-between",fontWeight:600 }}><span>Saldo</span><span style={{ color:i-e>=0?"var(--green)":"var(--red)" }}>{fmt(i-e)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
function Settings({ workspace, members, currentMember, onSignOut }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(workspace.invite_code);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  }

  return (
    <div className="page">
      <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800,marginBottom:24 }}>Configurações</h1>

      <div className="card fade-up" style={{ marginBottom:16 }}>
        <div className="sec-title" style={{ marginBottom:16 }}>Espaço do Casal</div>
        <div style={{ fontSize:14,marginBottom:4 }}><span style={{ color:"var(--text2)" }}>Nome: </span><strong>{workspace.name}</strong></div>
        <div style={{ fontSize:14,marginBottom:16 }}><span style={{ color:"var(--text2)" }}>Membros: </span><strong>{members.length}</strong></div>
        <div className="fl" style={{ marginBottom:8 }}>Código de convite para o parceiro</div>
        <div className="inv-code" style={{ fontSize:22,letterSpacing:4 }}>{workspace.invite_code}</div>
        <button className="btn btn-g" style={{ width:"100%" }} onClick={copy}>{copied?"✅ Copiado!":"📋 Copiar código"}</button>
      </div>

      <div className="card fade-up s1" style={{ marginBottom:16 }}>
        <div className="sec-title" style={{ marginBottom:16 }}>Membros</div>
        {members.map(m=>(
          <div key={m.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)" }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:m.color+"30",color:m.color,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>{m.display_name[0]}</div>
            <div>
              <div style={{ fontWeight:500 }}>{m.display_name}</div>
              <div style={{ fontSize:12,color:"var(--text2)" }}>{m.role==="owner"?"Proprietário":"Membro"}</div>
            </div>
            {m.user_id===currentMember?.user_id&&<span className="badge blue" style={{ marginLeft:"auto" }}>Você</span>}
          </div>
        ))}
      </div>

      <div className="card fade-up s2">
        <div className="sec-title" style={{ marginBottom:16 }}>Conta</div>
        <button className="btn btn-d" style={{ width:"100%" }} onClick={onSignOut}>🚪 Sair da conta</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers]     = useState([]);
  const [txs, setTxs]             = useState([]);
  const [goals, setGoals]         = useState([]);
  const [page, setPage]           = useState("dashboard");
  const [showNewTx, setShowNewTx] = useState(false);
  const [toasts, setToasts]       = useState([]);
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState([now.getFullYear(), now.getMonth()]);
  const channelRef = useRef(null);

  function addToast(msg, type="success") {
    const id = genId();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  }

  // Auth listener
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setSession(session);
      setLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);

  // Load workspace
  useEffect(()=>{
    if(!session) return;
    loadWorkspace();
  },[session]);

  async function loadWorkspace() {
    const { data: memberships } = await supabase.from("workspace_members").select("*").eq("user_id", session.user.id);
    if(!memberships||memberships.length===0) { setWorkspace(null); setLoading(false); return; }
    const wsId = memberships[0].workspace_id;
    const { data: ws } = await supabase.from("workspaces").select("*").eq("id",wsId).single();
    const { data: allMembers } = await supabase.from("workspace_members").select("*").eq("workspace_id",wsId);
    setWorkspace(ws);
    setMembers(allMembers||[]);
    await loadData(wsId);
    setupRealtime(wsId);
  }

  async function loadData(wsId) {
    const id = wsId || workspace?.id;
    if(!id) return;
    const [{ data: txData }, { data: goalData }] = await Promise.all([
      supabase.from("transactions").select("*").eq("workspace_id",id).order("date",{ascending:false}),
      supabase.from("goals").select("*").eq("workspace_id",id).order("created_at"),
    ]);
    setTxs(txData||[]);
    setGoals(goalData||[]);
  }

  function setupRealtime(wsId) {
    if(channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase.channel(`ws:${wsId}`)
      .on("postgres_changes",{ event:"*",schema:"public",table:"transactions",filter:`workspace_id=eq.${wsId}` },
        () => loadData(wsId))
      .on("postgres_changes",{ event:"*",schema:"public",table:"goals",filter:`workspace_id=eq.${wsId}` },
        () => loadData(wsId))
      .subscribe();
    channelRef.current = ch;
  }

  async function saveTx(tx) {
    const { error } = await supabase.from("transactions").insert({
      ...tx, workspace_id: workspace.id, user_id: session.user.id
    });
    if(error) { addToast("Erro ao salvar","error"); return; }
    setShowNewTx(false);
    addToast(`${tx.type==="income"?"Receita":"Despesa"} de ${fmt(tx.amount)} lançada!`);
  }

  async function deleteTx(id) {
    await supabase.from("transactions").delete().eq("id",id);
    addToast("Transação removida");
  }

  function changeMonth(dir) {
    setCurrentMonth(([y,m])=>{
      let nm=m+dir, ny=y;
      if(nm<0){nm=11;ny--;} if(nm>11){nm=0;ny++;}
      return [ny,nm];
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setWorkspace(null); setTxs([]); setGoals([]); setMembers([]);
  }

  const currentMember = members.find(m => m.user_id === session?.user?.id);

  const navItems = [
    { id:"dashboard",    icon:"📊", label:"Dashboard" },
    { id:"transactions", icon:"💸", label:"Transações" },
    { id:"cards",        icon:"💳", label:"Cartões" },
    { id:"goals",        icon:"🎯", label:"Metas" },
    { id:"reports",      icon:"📈", label:"Relatórios" },
    { id:"settings",     icon:"⚙️",  label:"Configurações" },
  ];
  const pageLabels = { dashboard:"Dashboard",transactions:"Transações",cards:"Cartões",goals:"Metas",reports:"Relatórios",settings:"Configurações" };

  const cardAlerts = (() => {
    const [y,m]=currentMonth;
    const mTxs=txs.filter(t=>{const d=new Date(t.date+"T12:00");return d.getFullYear()===y&&d.getMonth()===m;});
    return CREDIT_CARDS_DEFAULT.filter(c=>{ const u=mTxs.filter(t=>t.credit_card_id===c.id).reduce((s,t)=>s+Number(t.amount),0); return u/c.limit>0.8; }).length;
  })();

  // ── render ──
  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loading-screen">
        <div style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800 }}>Fin<span style={{ color:"var(--green)" }}>Duo</span></div>
        <div className="spinner" />
      </div>
    </>
  );

  if (!session) return (
    <>
      <style>{css}</style>
      <AuthScreen onAuth={() => {}} />
    </>
  );

  if (!workspace) return (
    <>
      <style>{css}</style>
      <Onboarding user={session.user} onDone={loadWorkspace} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* sidebar */}
        <nav className="sidebar">
          <div className="logo">
            <div className="logo-mark">
              <div className="logo-icon">F</div>
              <div className="logo-text">Fin<span>Duo</span></div>
            </div>
            <div className="ws-badge">
              <div className="ws-avs">
                {members.map(m=>(
                  <div key={m.id} className="ws-av" style={{ background:m.color+"30",color:m.color }}>{m.display_name[0]}</div>
                ))}
              </div>
              <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{workspace.name}</span>
              <div className="rt-dot" style={{ marginLeft:"auto",flexShrink:0 }} />
            </div>
          </div>

          <div className="nav-lbl">Principal</div>
          {navItems.map(n=>(
            <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
              {n.id==="cards"&&cardAlerts>0&&<span className="nav-badge">{cardAlerts}</span>}
            </div>
          ))}

          <div className="sidebar-foot">
            <div className="user-pill">
              <div className="uav" style={{ width:32,height:32,background:currentMember?.color+"30"||"#222",color:currentMember?.color||"var(--green)",fontSize:13 }}>
                {currentMember?.display_name?.[0]||"?"}
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:500 }}>{currentMember?.display_name}</div>
                <div style={{ fontSize:11,color:"var(--text2)" }}>{currentMember?.role==="owner"?"Proprietário":"Membro"}</div>
              </div>
            </div>
          </div>
        </nav>

        <main className="main">
          <div className="topbar">
            <div className="topbar-title">{pageLabels[page]}</div>
            <div className="topbar-actions">
              <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--text2)" }}>
                <div className="rt-dot" /><span>Ao vivo</span>
              </div>
              <div style={{ display:"flex" }}>
                {members.map(m=>(
                  <div key={m.id} style={{ width:28,height:28,borderRadius:"50%",background:m.color+"30",color:m.color,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,border:"2px solid var(--bg)",marginRight:-4 }}>{m.display_name[0]}</div>
                ))}
              </div>
              <button className="btn btn-p btn-sm" onClick={()=>setShowNewTx(true)}>+ Lançar</button>
            </div>
          </div>

          {page==="dashboard"    && <Dashboard txs={txs} goals={goals} members={members} currentMonth={currentMonth} onMonthChange={changeMonth} />}
          {page==="transactions" && <Transactions txs={txs} members={members} onDelete={deleteTx} currentMonth={currentMonth} onMonthChange={changeMonth} />}
          {page==="cards"        && <Cards txs={txs} members={members} currentMonth={currentMonth} />}
          {page==="goals"        && <Goals goals={goals} workspaceId={workspace.id} onRefresh={()=>loadData()} />}
          {page==="reports"      && <Reports txs={txs} members={members} />}
          {page==="settings"     && <Settings workspace={workspace} members={members} currentMember={currentMember} onSignOut={signOut} />}
        </main>
      </div>

      <button className="fab" onClick={()=>setShowNewTx(true)}>+</button>

      {showNewTx && <NewTxModal onClose={()=>setShowNewTx(false)} onSave={saveTx} />}

      <Toast toasts={toasts} />
    </>
  );
}
  .stat-icon{position:absolute;right:16px;top:16px;font-size:20px;opacity:.3}
  /* grid */
  .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .g2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
  /* buttons */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 18px;border-radius:var(--radius-sm);font-family:var(--font-b);font-size:14px;font-weight:500;cursor:pointer;border:none;transition:all .15s}
  .btn-p{background:var(--green);color:#000;font-weight:600}
  .btn-p:hover{background:#00ccaa;transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,229,160,0.3)}
  .btn-p:disabled{opacity:.4;cursor:not-allowed;transform:none}
  .btn-g{background:transparent;color:var(--text2);border:1px solid var(--border2)}
  .btn-g:hover{background:var(--surface2);color:var(--text)}
  .btn-d{background:var(--red-dim);color:var(--red);border:1px solid rgba(255,77,109,.2)}
  .btn-d:hover{background:rgba(255,77,109,.2)}
  .btn-sm{padding:6px 12px;font-size:12px}
  .btn-lg{padding:14px 28px;font-size:15px;font-weight:600}
  .fab{position:fixed;right:28px;bottom:28px;width:52px;height:52px;border-radius:50%;background:var(--green);color:#000;font-size:24px;font-weight:700;cursor:pointer;border:none;box-shadow:0 4px 24px rgba(0,229,160,0.4);display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:200}
  .fab:hover{transform:scale(1.08) rotate(45deg);box-shadow:0 6px 32px rgba(0,229,160,0.5)}
  /* modal */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;animation:fadeIn .2s ease}
  .modal{background:var(--surface);border:1px solid var(--border2);border-radius:20px;padding:28px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:pop .3s ease both}
  .modal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
  .modal-title{font-family:var(--font-d);font-size:18px;font-weight:700}
  .modal-close{width:30px;height:30px;border-radius:50%;background:var(--surface2);border:none;color:var(--text2);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .modal-close:hover{background:var(--surface3);color:var(--text)}
  /* forms */
  .fg{margin-bottom:16px}
  .fl{display:block;font-size:12px;font-weight:500;color:var(--text2);margin-bottom:6px;letter-spacing:.5px}
  .fi{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text);font-family:var(--font-b);font-size:14px;transition:border-color .2s;outline:none}
  .fi:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(0,229,160,0.1)}
  .fi::placeholder{color:var(--text2);opacity:.5}
  .amt-wrap{position:relative;margin-bottom:20px}
  .amt-pre{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:20px;color:var(--text2);font-family:var(--font-d);font-weight:600}
  .amt-inp{width:100%;background:var(--surface2);border:2px solid var(--border2);border-radius:var(--radius);padding:16px 14px 16px 40px;color:var(--text);font-family:var(--font-d);font-size:28px;font-weight:700;outline:none;transition:border-color .2s}
  .amt-inp:focus{border-color:var(--green);box-shadow:0 0 0 4px rgba(0,229,160,0.1)}
  .type-tog{display:flex;background:var(--surface2);border-radius:var(--radius-sm);padding:4px;margin-bottom:20px;gap:4px}
  .type-btn{flex:1;padding:8px;border-radius:8px;border:none;font-family:var(--font-b);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--text2);background:transparent}
  .type-btn.ae{background:var(--red);color:#fff}
  .type-btn.ai{background:var(--green);color:#000}
  .cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .cat-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;border-radius:var(--radius-sm);background:var(--surface2);border:1.5px solid transparent;cursor:pointer;transition:all .15s;font-size:11px;color:var(--text2);text-align:center}
  .cat-btn:hover{background:var(--surface3);color:var(--text)}
  .cat-btn.sel{border-color:var(--green);background:var(--green-dim);color:var(--green)}
  .pay-grid{display:flex;gap:8px}
  .pay-btn{flex:1;padding:8px;border-radius:8px;background:var(--surface2);border:1.5px solid transparent;cursor:pointer;font-size:12px;font-weight:500;color:var(--text2);text-align:center;transition:all .15s}
  .pay-btn:hover{background:var(--surface3)}
  .pay-btn.sel{border-color:var(--blue);background:var(--blue-dim);color:var(--blue)}
  .fsel{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text);font-family:var(--font-b);font-size:14px;outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238888aa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;transition:border-color .2s}
  .fsel:focus{border-color:var(--green)}
  /* tx */
  .tx-list{display:flex;flex-direction:column;gap:2px}
  .tx-item{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--radius-sm);transition:background .15s;cursor:pointer}
  .tx-item:hover{background:var(--surface2)}
  .tx-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
  .tx-info{flex:1;min-width:0}
  .tx-desc{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tx-meta{font-size:11px;color:var(--text2);margin-top:1px}
  .tx-amt{font-family:var(--font-d);font-size:15px;font-weight:700;white-space:nowrap}
  .tx-amt.income{color:var(--green)}.tx-amt.expense{color:var(--red)}
  .tx-who{width:22px;height:22px;border-radius:50%;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  /* progress */
  .prog-bar{height:6px;background:var(--surface3);border-radius:99px;overflow:hidden;margin-top:8px}
  .prog-fill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(0.34,1.56,0.64,1)}
  /* misc */
  .sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
  .sec-title{font-family:var(--font-d);font-size:15px;font-weight:700}
  .month-nav{display:flex;align-items:center;gap:12px}
  .month-nav button{background:var(--surface2);border:1px solid var(--border2);color:var(--text2);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .month-nav button:hover{background:var(--surface3);color:var(--text)}
  .month-nav span{font-size:14px;font-weight:500;min-width:100px;text-align:center}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600}
  .badge.green{background:var(--green-dim);color:var(--green)}.badge.red{background:var(--red-dim);color:var(--red)}.badge.blue{background:var(--blue-dim);color:var(--blue)}.badge.yellow{background:var(--yellow-dim);color:var(--yellow)}
  .alert{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:var(--radius-sm);font-size:13px;margin-bottom:8px}
  .alert.warn{background:var(--yellow-dim);border:1px solid rgba(255,209,102,.2);color:var(--yellow)}
  .alert.danger{background:var(--red-dim);border:1px solid rgba(255,77,109,.2);color:var(--red)}
  .alert.info{background:var(--blue-dim);border:1px solid rgba(77,159,255,.2);color:var(--blue)}
  .alert.success{background:var(--green-dim);border:1px solid rgba(0,229,160,.2);color:var(--green)}
  .chip{display:inline-flex;align-items:center;background:var(--surface2);border:1px solid var(--border2);border-radius:20px;padding:4px 12px;font-size:12px;color:var(--text2);cursor:pointer;transition:all .15s;gap:4px}
  .chip:hover,.chip.active{background:var(--green-dim);border-color:var(--green);color:var(--green)}
  .divider{height:1px;background:var(--border);margin:16px 0}
  .empty{text-align:center;padding:48px 24px;color:var(--text2)}
  .empty-icon{font-size:40px;margin-bottom:12px;opacity:.5}
  .empty-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px}
  .rt-dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 0 rgba(0,229,160,0.4);animation:rtPulse 2s infinite}
  .bar-chart{display:flex;align-items:flex-end;gap:10px;height:80px}
  .bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
  .bar{width:100%;border-radius:4px 4px 0 0;transition:height .5s cubic-bezier(0.34,1.56,0.64,1);min-height:2px}
  .bar-lbl{font-size:10px;color:var(--text2)}
  .cc-vis{background:linear-gradient(135deg,#1a1a3a 0%,#2d2d60 100%);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px;position:relative;overflow:hidden}
  .cc-vis::before{content:'';position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.04)}
  .goal-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px;transition:border-color .2s}
  .goal-card:hover{border-color:var(--border2)}
  .spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,.1);border-top-color:var(--green);border-radius:50%;animation:spin .7s linear infinite}
  .tabs{display:flex;border-bottom:1px solid var(--border);gap:4px;margin-bottom:20px}
  .tab{padding:10px 16px;font-size:13px;font-weight:500;color:var(--text2);cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;margin-bottom:-1px}
  .tab:hover{color:var(--text)}.tab.active{color:var(--green);border-bottom-color:var(--green)}
  /* toast */
  .toast-wrap{position:fixed;bottom:90px;right:28px;display:flex;flex-direction:column;gap:8px;z-index:2000}
  .toast{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:12px 16px;font-size:13px;box-shadow:var(--shadow);display:flex;align-items:center;gap:8px;animation:fadeIn .3s ease;max-width:280px}
  /* auth */
  .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg)}
  .auth-box{background:var(--surface);border:1px solid var(--border2);border-radius:24px;padding:36px;width:100%;max-width:400px;box-shadow:var(--shadow-lg)}
  /* loading */
  .loading-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:var(--bg)}
  /* onboarding */
  .ob-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg)}
  .ob-box{background:var(--surface);border:1px solid var(--border2);border-radius:24px;padding:36px;width:100%;max-width:460px}
  .ob-step{display:flex;align-items:center;gap:8px;margin-bottom:24px}
  .ob-dot{width:8px;height:8px;border-radius:50%;background:var(--surface3)}
  .ob-dot.active{background:var(--green)}
  /* invite */
  .inv-code{font-family:var(--font-d);font-size:28px;font-weight:800;letter-spacing:6px;color:var(--green);text-align:center;padding:16px;background:var(--green-dim);border-radius:var(--radius);border:1px solid rgba(0,229,160,.2);margin:16px 0}
  @media(max-width:768px){
    .sidebar{display:none}
    .g4{grid-template-columns:repeat(2,1fr)}
    .g3{grid-template-columns:1fr}
    .page{padding:16px}
    .topbar{padding:0 16px}
  }
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span>{t.type==="success"?"✅":"❌"}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handle() {
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setDone(true);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) return (
    <div className="auth-wrap">
      <div className="auth-box" style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
        <h2 style={{ fontFamily:"var(--font-d)", fontSize:22, fontWeight:800, marginBottom:8 }}>Confirme seu e-mail</h2>
        <p style={{ color:"var(--text2)", fontSize:14 }}>Enviamos um link de confirmação para <strong style={{ color:"var(--text)" }}>{email}</strong>. Acesse seu e-mail e clique no link para ativar sua conta.</p>
        <button className="btn btn-g" style={{ marginTop:20 }} onClick={() => { setDone(false); setMode("login"); }}>← Voltar ao login</button>
      </div>
    </div>
  );

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:8 }}>
            <div className="logo-icon">F</div>
            <span style={{ fontFamily:"var(--font-d)", fontSize:24, fontWeight:800 }}>Fin<span style={{ color:"var(--green)" }}>Duo</span></span>
          </div>
          <p style={{ color:"var(--text2)", fontSize:13 }}>Controle financeiro para casais</p>
        </div>

        <div className="tabs" style={{ marginBottom:24 }}>
          <div className={`tab ${mode==="login"?"active":""}`} onClick={() => { setMode("login"); setError(""); }}>Entrar</div>
          <div className={`tab ${mode==="signup"?"active":""}`} onClick={() => { setMode("signup"); setError(""); }}>Criar conta</div>
        </div>

        {error && <div className="alert danger" style={{ marginBottom:16 }}>⚠️ {error}</div>}

        <div className="fg">
          <label className="fl">E-mail</label>
          <input className="fi" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handle()} />
        </div>
        <div className="fg">
          <label className="fl">Senha</label>
          <input className="fi" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handle()} />
        </div>

        <button className="btn btn-p btn-lg" style={{ width:"100%", marginTop:8 }} onClick={handle} disabled={loading||!email||!password}>
          {loading ? <div className="spinner" /> : mode==="login" ? "Entrar →" : "Criar conta →"}
        </button>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ user, onDone }) {
  const [step, setStep] = useState(1); // 1=create or join, 2=create, 3=join, 4=done
  const [wsName, setWsName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createWorkspace() {
    if (!wsName || !displayName) return;
    setLoading(true); setError("");
    try {
      const { data: ws, error: e1 } = await supabase.from("workspaces").insert({ name: wsName }).select().single();
      if (e1) throw e1;
      const color = USER_COLORS[0];
      const { error: e2 } = await supabase.from("workspace_members").insert({
        workspace_id: ws.id, user_id: user.id, display_name: displayName, color, role: "owner"
      });
      if (e2) throw e2;
      setInviteCode(ws.invite_code);
      setStep(4);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function joinWorkspace() {
    if (!joinCode || !displayName) return;
    setLoading(true); setError("");
    try {
      const { data: ws, error: e1 } = await supabase.from("workspaces").select("*").eq("invite_code", joinCode.trim()).single();
      if (e1 || !ws) throw new Error("Código inválido. Verifique e tente novamente.");
      const color = USER_COLORS[1];
      const { error: e2 } = await supabase.from("workspace_members").insert({
        workspace_id: ws.id, user_id: user.id, display_name: displayName, color, role: "member"
      });
      if (e2) throw e2;
      onDone();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="ob-wrap">
      <div className="ob-box">
        <div style={{ display:"flex", gap:6, marginBottom:24 }}>
          {[1,2,3].map(i => <div key={i} className={`ob-dot ${step>=i?"active":""}`} />)}
        </div>

        {step === 1 && (
          <div className="fade-up">
            <h2 style={{ fontFamily:"var(--font-d)", fontSize:24, fontWeight:800, marginBottom:8 }}>Bem-vindo ao FinDuo 👋</h2>
            <p style={{ color:"var(--text2)", fontSize:14, marginBottom:28 }}>Você quer criar um novo espaço compartilhado ou entrar no espaço do seu parceiro?</p>
            <div className="g2" style={{ gap:12 }}>
              <button className="btn btn-p" style={{ padding:"20px 12px", flexDirection:"column", gap:8, height:"auto" }} onClick={() => setStep(2)}>
                <span style={{ fontSize:28 }}>✨</span>
                <div><div style={{ fontWeight:700 }}>Criar espaço</div><div style={{ fontSize:11, opacity:.7, fontWeight:400 }}>Novo casal</div></div>
              </button>
              <button className="btn btn-g" style={{ padding:"20px 12px", flexDirection:"column", gap:8, height:"auto" }} onClick={() => setStep(3)}>
                <span style={{ fontSize:28 }}>🔗</span>
                <div><div style={{ fontWeight:700 }}>Entrar</div><div style={{ fontSize:11, opacity:.7, fontWeight:400 }}>Tenho um código</div></div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up">
            <h2 style={{ fontFamily:"var(--font-d)", fontSize:22, fontWeight:800, marginBottom:8 }}>Criar espaço do casal</h2>
            <p style={{ color:"var(--text2)", fontSize:14, marginBottom:24 }}>Configure seu espaço compartilhado.</p>
            {error && <div className="alert danger" style={{ marginBottom:16 }}>⚠️ {error}</div>}
            <div className="fg">
              <label className="fl">Seu nome</label>
              <input className="fi" placeholder="Ex: Ana" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="fg">
              <label className="fl">Nome do espaço</label>
              <input className="fi" placeholder="Ex: Casal Silva" value={wsName} onChange={e => setWsName(e.target.value)} />
            </div>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button className="btn btn-g" onClick={() => setStep(1)}>← Voltar</button>
              <button className="btn btn-p" style={{ flex:1 }} onClick={createWorkspace} disabled={loading||!wsName||!displayName}>
                {loading ? <div className="spinner" /> : "Criar espaço →"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up">
            <h2 style={{ fontFamily:"var(--font-d)", fontSize:22, fontWeight:800, marginBottom:8 }}>Entrar no espaço</h2>
            <p style={{ color:"var(--text2)", fontSize:14, marginBottom:24 }}>Peça o código de convite para seu parceiro.</p>
            {error && <div className="alert danger" style={{ marginBottom:16 }}>⚠️ {error}</div>}
            <div className="fg">
              <label className="fl">Seu nome</label>
              <input className="fi" placeholder="Ex: João" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="fg">
              <label className="fl">Código de convite</label>
              <input className="fi" placeholder="ex: a1b2c3d4" value={joinCode} onChange={e => setJoinCode(e.target.value)} style={{ letterSpacing:3, fontSize:16 }} />
            </div>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button className="btn btn-g" onClick={() => setStep(1)}>← Voltar</button>
              <button className="btn btn-p" style={{ flex:1 }} onClick={joinWorkspace} disabled={loading||!joinCode||!displayName}>
                {loading ? <div className="spinner" /> : "Entrar →"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-up" style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
            <h2 style={{ fontFamily:"var(--font-d)", fontSize:22, fontWeight:800, marginBottom:8 }}>Espaço criado!</h2>
            <p style={{ color:"var(--text2)", fontSize:14, marginBottom:4 }}>Compartilhe este código com seu parceiro para ele entrar:</p>
            <div className="inv-code">{inviteCode}</div>
            <p style={{ color:"var(--text2)", fontSize:12, marginBottom:20 }}>Ele vai criar uma conta e usar esse código para entrar no seu espaço.</p>
            <button className="btn btn-p btn-lg" onClick={onDone}>Começar a usar →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TX ITEM ──────────────────────────────────────────────────────────────────
function TxItem({ tx, members, onClick }) {
  const cat  = getCat(tx.category_id);
  const card = tx.credit_card_id ? getCard(tx.credit_card_id) : null;
  const member = members.find(m => m.user_id === tx.user_id);
  return (
    <div className="tx-item" onClick={() => onClick && onClick(tx)}>
      <div className="tx-ico" style={{ background: cat.color + "20" }}>{cat.emoji}</div>
      <div className="tx-info">
        <div className="tx-desc">{tx.description || cat.name}</div>
        <div className="tx-meta">
          {cat.name} · {fmtDate(tx.date)} ·{" "}
          {tx.payment_method==="credit" && card ? `💳 ${card.name}` : tx.payment_method==="debit" ? "🏦 Débito" : "💵 Dinheiro"}
        </div>
      </div>
      {member && (
        <div className="tx-who" style={{ background: member.color+"30", color: member.color }}>
          {member.display_name[0]}
        </div>
      )}
      <div className={`tx-amt ${tx.type}`}>
        {tx.type==="income"?"+":"−"}{fmt(tx.amount)}
      </div>
    </div>
  );
}

// ─── NEW TX MODAL ─────────────────────────────────────────────────────────────
function NewTxModal({ onClose, onSave }) {
  const [type, setType]   = useState("expense");
  const [amount, setAmount] = useState("");
  const [desc, setDesc]   = useState("");
  const [catId, setCatId] = useState("");
  const [pay, setPay]     = useState("debit");
  const [cardId, setCardId] = useState("cc1");
  const [date, setDate]   = useState(new Date().toISOString().slice(0,10));
  const [saving, setSaving] = useState(false);

  const visibleCats = CATEGORIES.filter(c => c.type==="both" || c.type===type);

  async function handleSave() {
    if (!amount || !catId) return;
    setSaving(true);
    await onSave({
      type, amount: parseFloat(amount),
      description: desc || getCat(catId).name,
      category_id: catId, payment_method: pay,
      credit_card_id: pay==="credit" ? cardId : null,
      date,
    });
    setSaving(false);
  }

  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <div className="modal-title">Nova Transação</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="type-tog">
          <button className={`type-btn ${type==="expense"?"ae":""}`} onClick={() => { setType("expense"); setCatId(""); }}>↓ Despesa</button>
          <button className={`type-btn ${type==="income"?"ai":""}`}  onClick={() => { setType("income");  setCatId(""); }}>↑ Receita</button>
        </div>

        <div className="amt-wrap">
          <span className="amt-pre">R$</span>
          <input className="amt-inp" type="number" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
        </div>

        <div className="fg">
          <label className="fl">Descrição (opcional)</label>
          <input className="fi" placeholder="Ex: Almoço" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>

        <div className="fg">
          <label className="fl">Categoria</label>
          <div className="cat-grid">
            {visibleCats.map(c => (
              <button key={c.id} className={`cat-btn ${catId===c.id?"sel":""}`} onClick={() => setCatId(c.id)}>
                <span style={{ fontSize:20 }}>{c.emoji}</span>{c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="fg">
          <label className="fl">Forma de pagamento</label>
          <div className="pay-grid">
            {[{id:"debit",l:"🏦 Débito"},{id:"credit",l:"💳 Crédito"},{id:"cash",l:"💵 Dinheiro"}].map(p => (
              <button key={p.id} className={`pay-btn ${pay===p.id?"sel":""}`} onClick={() => setPay(p.id)}>{p.l}</button>
            ))}
          </div>
        </div>

        {pay==="credit" && (
          <div className="fg fade-in">
            <label className="fl">Cartão</label>
            <select className="fsel" value={cardId} onChange={e => setCardId(e.target.value)}>
              {CREDIT_CARDS_DEFAULT.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div className="fg">
          <label className="fl">Data</label>
          <input className="fi" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <button className="btn btn-p btn-lg" style={{ width:"100%" }} onClick={handleSave} disabled={saving||!amount||!catId}>
          {saving ? <div className="spinner" /> : "💾 Salvar"}
        </button>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function SC({ label, value, color, icon, sub }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-lbl">{label}</div>
      <div className={`stat-val ${color}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ txs, goals, members, currentMonth, onMonthChange }) {
  const [y, m] = currentMonth;
  const mTxs = txs.filter(t => { const d=new Date(t.date+"T12:00"); return d.getFullYear()===y && d.getMonth()===m; });

  const inc  = mTxs.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const exp  = mTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
  const bal  = inc - exp;
  const savR = inc>0 ? Math.round(bal/inc*100) : 0;

  const byCat = {};
  mTxs.filter(t=>t.type==="expense").forEach(t => { byCat[t.category_id]=(byCat[t.category_id]||0)+Number(t.amount); });
  const catList = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);

  const barData = Array.from({length:6},(_,i) => {
    const mi = ((m-5+i)+12)%12;
    const yi = m-5+i<0?y-1:y;
    const bd = txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===yi&&d.getMonth()===mi; });
    return { label:MONTHS[mi], inc:bd.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0), exp:bd.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0) };
  });
  const maxBar = Math.max(...barData.map(b=>Math.max(b.inc,b.exp)),1);

  const cardUsage = CREDIT_CARDS_DEFAULT.map(c => ({
    ...c, used: mTxs.filter(t=>t.credit_card_id===c.id).reduce((s,t)=>s+Number(t.amount),0)
  }));

  const recent = [...mTxs].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);

  const alerts = [];
  if(bal<0) alerts.push({type:"danger",msg:"⚠️ Gastos superiores às receitas este mês!"});
  cardUsage.forEach(c => { if(c.used/c.limit>0.8) alerts.push({type:"warn",msg:`💳 ${c.name} está a ${Math.round(c.used/c.limit*100)}% do limite`}); });
  if(savR<10&&inc>0) alerts.push({type:"info",msg:"💡 Taxa de poupança abaixo de 10%."});

  return (
    <div className="page">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800,letterSpacing:"-.5px" }}>Dashboard</h1>
          <p style={{ color:"var(--text2)",fontSize:13,marginTop:2 }}>Visão completa do casal</p>
        </div>
        <div className="month-nav">
          <button onClick={()=>onMonthChange(-1)}>‹</button>
          <span>{MONTH_NAMES[m]} {y}</span>
          <button onClick={()=>onMonthChange(1)}>›</button>
        </div>
      </div>

      {alerts.map((a,i) => <div key={i} className={`alert ${a.type}`}>{a.msg}</div>)}

      <div className="g4 fade-up" style={{ marginBottom:20 }}>
        <SC label="Saldo do Mês" value={fmt(bal)} color={bal>=0?"green":"red"} icon="💰" sub={`Poupança: ${savR}%`} />
        <SC label="Receitas" value={fmt(inc)} color="green" icon="↑" sub={`${mTxs.filter(t=>t.type==="income").length} lançamentos`} />
        <SC label="Despesas" value={fmt(exp)} color="red" icon="↓" sub={`${mTxs.filter(t=>t.type==="expense").length} lançamentos`} />
        <SC label="No crédito" value={fmt(cardUsage.reduce((s,c)=>s+c.used,0))} color="blue" icon="💳" />
      </div>

      <div className="g3" style={{ marginBottom:20 }}>
        <div className="card s1 fade-up" style={{ gridColumn:"span 2" }}>
          <div className="sec-hd">
            <div className="sec-title">Evolução Mensal</div>
            <div style={{ display:"flex",gap:12,fontSize:12 }}>
              <span style={{ color:"var(--green)" }}>● Receitas</span>
              <span style={{ color:"var(--red)" }}>● Despesas</span>
            </div>
          </div>
          <div className="bar-chart">
            {barData.map((b,i) => (
              <div key={i} className="bar-col">
                <div style={{ position:"relative",display:"flex",alignItems:"flex-end",gap:3,height:72 }}>
                  <div className="bar" style={{ background:"var(--green)",opacity:.8,height:`${(b.inc/maxBar)*100}%`,width:"40%" }} />
                  <div className="bar" style={{ background:"var(--red)",opacity:.8,height:`${(b.exp/maxBar)*100}%`,width:"40%" }} />
                </div>
                <div className="bar-lbl">{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card s2 fade-up">
          <div className="sec-title" style={{ marginBottom:16 }}>Por Categoria</div>
          {catList.length===0 ? <div style={{ color:"var(--text2)",fontSize:13,textAlign:"center",padding:"24px 0" }}>Sem gastos</div> :
            catList.slice(0,5).map(([cId,val]) => {
              const cat=getCat(cId); const pct=exp>0?(val/exp)*100:0;
              return (
                <div key={cId} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4 }}>
                    <span>{cat.emoji} {cat.name}</span>
                    <span style={{ color:"var(--text2)" }}>{fmt(val)}</span>
                  </div>
                  <div className="prog-bar"><div className="prog-fill" style={{ width:`${pct}%`,background:cat.color }} /></div>
                </div>
              );
            })
          }
        </div>
      </div>

      <div className="g2" style={{ marginBottom:20 }}>
        <div className="card s3 fade-up">
          <div className="sec-hd"><div className="sec-title">Cartões</div></div>
          {cardUsage.map(c => {
            const pct=Math.min((c.used/c.limit)*100,100);
            return (
              <div key={c.id} style={{ marginBottom:16 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                  <span style={{ fontSize:14,fontWeight:500 }}>💳 {c.name}</span>
                  <span className={`badge ${pct>80?"red":pct>50?"yellow":"green"}`}>{Math.round(pct)}%</span>
                </div>
                <div style={{ fontSize:12,color:"var(--text2)",marginBottom:6 }}>{fmt(c.used)} / {fmt(c.limit)}</div>
                <div className="prog-bar"><div className="prog-fill" style={{ width:`${pct}%`,background:pct>80?"var(--red)":pct>50?"var(--yellow)":"var(--green)" }} /></div>
              </div>
            );
          })}
        </div>

        <div className="card s4 fade-up">
          <div className="sec-hd"><div className="sec-title">Metas</div></div>
          {goals.slice(0,3).map(g => {
            const pct=Math.min((g.current/g.target)*100,100);
            return (
              <div key={g.id} style={{ marginBottom:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4 }}>
                  <span>{g.emoji} {g.name}</span>
                  <span style={{ color:"var(--text2)" }}>{Math.round(pct)}%</span>
                </div>
                <div className="prog-bar"><div className="prog-fill" style={{ width:`${pct}%`,background:pct>=100?"var(--green)":"var(--blue)" }} /></div>
                <div style={{ fontSize:11,color:"var(--text2)",marginTop:4 }}>{fmt(g.current)} de {fmt(g.target)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card s5 fade-up">
        <div className="sec-hd"><div className="sec-title">Últimas Transações</div></div>
        {recent.length===0 ? (
          <div className="empty"><div className="empty-icon">📭</div><div className="empty-title">Sem transações</div></div>
        ) : (
          <div className="tx-list">{recent.map(tx => <TxItem key={tx.id} tx={tx} members={members} />)}</div>
        )}
      </div>
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
function Transactions({ txs, members, onDelete, currentMonth, onMonthChange }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [y, m] = currentMonth;

  const mTxs = txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
  const inc  = mTxs.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const exp  = mTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);

  const filtered = mTxs.filter(t => {
    if(filter==="income"&&t.type!=="income") return false;
    if(filter==="expense"&&t.type!=="expense") return false;
    if(filter==="credit"&&t.payment_method!=="credit") return false;
    if(search&&!(t.description||"").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));

  return (
    <div className="page">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800 }}>Transações</h1>
          <p style={{ color:"var(--text2)",fontSize:13 }}>{MONTH_NAMES[m]} {y}</p>
        </div>
        <div className="month-nav">
          <button onClick={()=>onMonthChange(-1)}>‹</button>
          <span>{MONTHS[m]}/{y}</span>
          <button onClick={()=>onMonthChange(1)}>›</button>
        </div>
      </div>

      <div className="g3 fade-up" style={{ marginBottom:20 }}>
        <SC label="Receitas" value={fmt(inc)} color="green" icon="↑" />
        <SC label="Despesas" value={fmt(exp)} color="red" icon="↓" />
        <SC label="Saldo" value={fmt(inc-exp)} color={inc-exp>=0?"green":"red"} icon="💰" />
      </div>

      <div className="card fade-up s1">
        <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap" }}>
          {["all","income","expense","credit"].map(f => (
            <button key={f} className={`chip ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
              {f==="all"?"Todos":f==="income"?"Receitas":f==="expense"?"Despesas":"Crédito"}
            </button>
          ))}
          <input className="fi" style={{ marginLeft:"auto",width:"auto",flex:1,maxWidth:200,padding:"6px 12px",fontSize:13 }}
            placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {filtered.length===0 ? (
          <div className="empty"><div className="empty-icon">🔍</div><div className="empty-title">Nenhuma transação</div></div>
        ) : (
          <div className="tx-list">{filtered.map(tx=><TxItem key={tx.id} tx={tx} members={members} onClick={setSel} />)}</div>
        )}
      </div>

      {sel && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setSel(null)}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">Detalhes</div>
              <button className="modal-close" onClick={()=>setSel(null)}>✕</button>
            </div>
            {(() => {
              const cat=getCat(sel.category_id);
              const member=members.find(m=>m.user_id===sel.user_id);
              const card=sel.credit_card_id?getCard(sel.credit_card_id):null;
              return (
                <div>
                  <div style={{ textAlign:"center",padding:"16px 0 24px" }}>
                    <div style={{ fontSize:40,marginBottom:8 }}>{cat.emoji}</div>
                    <div className={`stat-val ${sel.type}`} style={{ fontSize:32,fontFamily:"var(--font-d)" }}>
                      {sel.type==="income"?"+":"−"}{fmt(sel.amount)}
                    </div>
                    <div style={{ color:"var(--text2)",marginTop:4 }}>{sel.description||cat.name}</div>
                  </div>
                  <div className="divider" />
                  {[
                    ["Categoria",`${cat.emoji} ${cat.name}`],
                    ["Data",fmtDate(sel.date)],
                    ["Pagamento",sel.payment_method==="credit"?"💳 Crédito":sel.payment_method==="debit"?"🏦 Débito":"💵 Dinheiro"],
                    card?["Cartão",card.name]:null,
                    member?["Lançado por",member.display_name]:null,
                  ].filter(Boolean).map(([k,v])=>(
                    <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)",fontSize:14 }}>
                      <span style={{ color:"var(--text2)" }}>{k}</span>
                      <span style={{ fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                  <button className="btn btn-d" style={{ width:"100%",marginTop:20 }} onClick={()=>{ onDelete(sel.id); setSel(null); }}>
                    🗑️ Excluir
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CARTÕES ──────────────────────────────────────────────────────────────────
function Cards({ txs, members, currentMonth }) {
  const [y, m] = currentMonth;
  const mTxs = txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
  return (
    <div className="page">
      <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800,marginBottom:6 }}>Cartões de Crédito</h1>
      <p style={{ color:"var(--text2)",fontSize:13,marginBottom:24 }}>{MONTH_NAMES[m]} {y}</p>
      <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
        {CREDIT_CARDS_DEFAULT.map(card=>{
          const cTxs=mTxs.filter(t=>t.credit_card_id===card.id);
          const used=cTxs.reduce((s,t)=>s+Number(t.amount),0);
          const pct=Math.min((used/card.limit)*100,100);
          return (
            <div key={card.id} className="card fade-up">
              <div className="cc-vis" style={{ marginBottom:16 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                  <div style={{ fontSize:20,fontWeight:700,fontFamily:"var(--font-d)",color:card.color }}>{card.name}</div>
                  <span className={`badge ${pct>80?"red":pct>50?"yellow":"green"}`}>{Math.round(pct)}% usado</span>
                </div>
                <div style={{ fontFamily:"var(--font-d)",fontSize:26,fontWeight:700,marginBottom:10 }}>
                  {fmt(used)}<span style={{ fontSize:14,color:"rgba(255,255,255,.4)",fontWeight:400 }}> / {fmt(card.limit)}</span>
                </div>
                <div className="prog-bar" style={{ height:8 }}>
                  <div className="prog-fill" style={{ width:`${pct}%`,background:pct>80?"var(--red)":pct>50?"var(--yellow)":"var(--green)" }} />
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",marginTop:10,fontSize:12,color:"rgba(255,255,255,.5)" }}>
                  <span>Fecha dia {card.closingDay}</span><span>Vence dia {card.dueDay}</span><span>Disponível: {fmt(card.limit-used)}</span>
                </div>
              </div>
              <div className="sec-hd">
                <div className="sec-title">Transações do mês</div>
                <span className="badge blue">{cTxs.length}</span>
              </div>
              {cTxs.length===0 ? (
                <div className="empty" style={{ padding:24 }}><div className="empty-icon">💳</div><div style={{ fontSize:13,color:"var(--text2)" }}>Sem gastos</div></div>
              ) : (
                <div className="tx-list">{[...cTxs].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(tx=><TxItem key={tx.id} tx={tx} members={members} />)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── METAS ────────────────────────────────────────────────────────────────────
function Goals({ goals, workspaceId, onRefresh }) {
  const [showNew, setShowNew] = useState(false);
  const [aportGoal, setAportGoal] = useState(null);
  const [aportAmt, setAportAmt] = useState("");
  const [newG, setNewG] = useState({ name:"", emoji:"🎯", target:"", current:"0", deadline:"" });
  const [saving, setSaving] = useState(false);

  const emojis = ["🎯","✈️","🏠","🚗","💻","📱","🛡️","💍","🎓","🏖️","💪","🎮"];

  async function createGoal() {
    if(!newG.name||!newG.target) return;
    setSaving(true);
    await supabase.from("goals").insert({ workspace_id:workspaceId, name:newG.name, emoji:newG.emoji, target:+newG.target, current:+newG.current, deadline:newG.deadline||null });
    await onRefresh();
    setShowNew(false);
    setSaving(false);
  }

  async function aport(g) {
    if(!aportAmt) return;
    const newVal = Math.min(g.current+parseFloat(aportAmt), g.target);
    await supabase.from("goals").update({ current:newVal }).eq("id",g.id);
    await onRefresh();
    setAportGoal(null);
  }

  return (
    <div className="page">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800 }}>Metas</h1>
          <p style={{ color:"var(--text2)",fontSize:13 }}>{goals.filter(g=>g.current>=g.target).length} de {goals.length} concluídas</p>
        </div>
        <button className="btn btn-p" onClick={()=>setShowNew(true)}>+ Nova meta</button>
      </div>

      <div className="g2">
        {goals.map((g,i)=>{
          const pct=Math.min((g.current/g.target)*100,100);
          const done=g.current>=g.target;
          const dl=g.deadline?new Date(g.deadline):null;
          const days=dl?Math.ceil((dl-new Date())/(864e5)):null;
          return (
            <div key={g.id} className={`goal-card fade-up s${i%5+1}`}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:done?"var(--green-dim)":"var(--surface2)",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center" }}>{g.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600 }}>{g.name}</div>
                  {dl&&<div style={{ fontSize:12,color:days<30?"var(--red)":"var(--text2)" }}>{done?"✅ Concluída!":days>0?`${days} dias restantes`:"Prazo encerrado"}</div>}
                </div>
                {done&&<span className="badge green">✓</span>}
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6 }}>
                <span style={{ fontFamily:"var(--font-d)",fontWeight:700,color:"var(--green)" }}>{fmt(g.current)}</span>
                <span style={{ color:"var(--text2)" }}>de {fmt(g.target)}</span>
              </div>
              <div className="prog-bar" style={{ height:8,marginBottom:12 }}>
                <div className="prog-fill" style={{ width:`${pct}%`,background:done?"var(--green)":pct>60?"var(--blue)":"var(--purple)" }} />
              </div>
              {!done&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:12,color:"var(--text2)" }}>Faltam {fmt(g.target-g.current)}</span>
                <button className="btn btn-g btn-sm" onClick={()=>{ setAportGoal(g); setAportAmt(""); }}>+ Aportar</button>
              </div>}
            </div>
          );
        })}
      </div>

      {goals.length===0&&<div className="empty"><div className="empty-icon">🎯</div><div className="empty-title">Nenhuma meta</div><div style={{ fontSize:13 }}>Defina objetivos financeiros para o casal</div></div>}

      {showNew&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowNew(false)}>
          <div className="modal">
            <div className="modal-hd"><div className="modal-title">Nova Meta</div><button className="modal-close" onClick={()=>setShowNew(false)}>✕</button></div>
            <div className="fg">
              <label className="fl">Ícone</label>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {emojis.map(e=>(
                  <button key={e} onClick={()=>setNewG(g=>({...g,emoji:e}))} style={{ width:36,height:36,borderRadius:8,fontSize:18,cursor:"pointer",background:newG.emoji===e?"var(--green-dim)":"var(--surface2)",border:newG.emoji===e?"1.5px solid var(--green)":"1.5px solid transparent",display:"flex",alignItems:"center",justifyContent:"center" }}>{e}</button>
                ))}
              </div>
            </div>
            <div className="fg"><label className="fl">Nome</label><input className="fi" placeholder="Ex: Viagem para Europa" value={newG.name} onChange={e=>setNewG(g=>({...g,name:e.target.value}))} /></div>
            <div className="g2" style={{ gap:12,marginBottom:16 }}>
              <div><label className="fl">Valor alvo</label><input className="fi" type="number" placeholder="0" value={newG.target} onChange={e=>setNewG(g=>({...g,target:e.target.value}))} /></div>
              <div><label className="fl">Já guardado</label><input className="fi" type="number" placeholder="0" value={newG.current} onChange={e=>setNewG(g=>({...g,current:e.target.value}))} /></div>
            </div>
            <div className="fg"><label className="fl">Prazo</label><input className="fi" type="date" value={newG.deadline} onChange={e=>setNewG(g=>({...g,deadline:e.target.value}))} /></div>
            <button className="btn btn-p btn-lg" style={{ width:"100%" }} onClick={createGoal} disabled={saving||!newG.name||!newG.target}>
              {saving?<div className="spinner"/>:"🎯 Criar meta"}
            </button>
          </div>
        </div>
      )}

      {aportGoal&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setAportGoal(null)}>
          <div className="modal">
            <div className="modal-hd"><div className="modal-title">Aportar em {aportGoal.emoji} {aportGoal.name}</div><button className="modal-close" onClick={()=>setAportGoal(null)}>✕</button></div>
            <div style={{ fontSize:13,color:"var(--text2)",marginBottom:12 }}>{fmt(aportGoal.current)} / {fmt(aportGoal.target)}</div>
            <div className="amt-wrap"><span className="amt-pre">R$</span><input className="amt-inp" type="number" placeholder="0,00" value={aportAmt} onChange={e=>setAportAmt(e.target.value)} autoFocus /></div>
            <button className="btn btn-p btn-lg" style={{ width:"100%" }} onClick={()=>aport(aportGoal)} disabled={!aportAmt}>💰 Confirmar aporte</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
function Reports({ txs, members }) {
  const now = new Date();
  const months = Array.from({length:6},(_,i)=>{ const d=new Date(now.getFullYear(),now.getMonth()-i,1); return {y:d.getFullYear(),m:d.getMonth()}; }).reverse();

  const byCat = {};
  txs.filter(t=>t.type==="expense").forEach(t=>{ byCat[t.category_id]=(byCat[t.category_id]||0)+Number(t.amount); });
  const totalExp = Object.values(byCat).reduce((s,v)=>s+v,0);

  return (
    <div className="page">
      <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800,marginBottom:6 }}>Relatórios</h1>
      <p style={{ color:"var(--text2)",fontSize:13,marginBottom:24 }}>Últimos 6 meses</p>

      <div className="card fade-up" style={{ marginBottom:20 }}>
        <div className="sec-title" style={{ marginBottom:16 }}>Gastos por Categoria (acumulado)</div>
        {Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([cId,val])=>{
          const cat=getCat(cId); const pct=totalExp>0?(val/totalExp)*100:0;
          return (
            <div key={cId} style={{ marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4 }}>
                <span>{cat.emoji} {cat.name}</span>
                <div style={{ display:"flex",gap:12 }}>
                  <span style={{ color:"var(--text2)" }}>{Math.round(pct)}%</span>
                  <span style={{ fontWeight:600 }}>{fmt(val)}</span>
                </div>
              </div>
              <div className="prog-bar"><div className="prog-fill" style={{ width:`${pct}%`,background:cat.color }} /></div>
            </div>
          );
        })}
      </div>

      <div className="card fade-up s1" style={{ marginBottom:20 }}>
        <div className="sec-title" style={{ marginBottom:16 }}>Resumo Mensal</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid var(--border)" }}>
                <th style={{ textAlign:"left",padding:"8px 12px",color:"var(--text2)",fontWeight:500 }}>Mês</th>
                <th style={{ textAlign:"right",padding:"8px 12px",color:"var(--green)",fontWeight:500 }}>Receitas</th>
                <th style={{ textAlign:"right",padding:"8px 12px",color:"var(--red)",fontWeight:500 }}>Despesas</th>
                <th style={{ textAlign:"right",padding:"8px 12px",fontWeight:500 }}>Saldo</th>
                <th style={{ textAlign:"right",padding:"8px 12px",color:"var(--text2)",fontWeight:500 }}>Poupança</th>
              </tr>
            </thead>
            <tbody>
              {months.map(({y,m})=>{
                const mTx=txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
                const i=mTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
                const e=mTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
                const b=i-e; const sv=i>0?Math.round(b/i*100):0;
                return (
                  <tr key={`${y}-${m}`} style={{ borderBottom:"1px solid var(--border)" }}>
                    <td style={{ padding:"10px 12px",fontWeight:500 }}>{MONTHS[m]}/{y}</td>
                    <td style={{ padding:"10px 12px",textAlign:"right",color:"var(--green)" }}>{fmt(i)}</td>
                    <td style={{ padding:"10px 12px",textAlign:"right",color:"var(--red)" }}>{fmt(e)}</td>
                    <td style={{ padding:"10px 12px",textAlign:"right",fontWeight:600,color:b>=0?"var(--green)":"var(--red)" }}>{fmt(b)}</td>
                    <td style={{ padding:"10px 12px",textAlign:"right" }}><span className={`badge ${sv>=20?"green":sv>=10?"yellow":"red"}`}>{sv}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card fade-up s2">
        <div className="sec-title" style={{ marginBottom:16 }}>Por Usuário</div>
        <div className="g2">
          {members.map(member=>{
            const uTx=txs.filter(t=>t.user_id===member.user_id);
            const i=uTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
            const e=uTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
            return (
              <div key={member.id} style={{ padding:16,background:"var(--surface2)",borderRadius:12 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                  <div style={{ width:36,height:36,borderRadius:"50%",background:member.color+"30",color:member.color,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>{member.display_name[0]}</div>
                  <div><div style={{ fontWeight:600 }}>{member.display_name}</div></div>
                </div>
                <div style={{ fontSize:13,display:"flex",flexDirection:"column",gap:6 }}>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ color:"var(--text2)" }}>Receitas</span><span style={{ color:"var(--green)" }}>{fmt(i)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ color:"var(--text2)" }}>Despesas</span><span style={{ color:"var(--red)" }}>{fmt(e)}</span></div>
                  <div className="divider" style={{ margin:"4px 0" }} />
                  <div style={{ display:"flex",justifyContent:"space-between",fontWeight:600 }}><span>Saldo</span><span style={{ color:i-e>=0?"var(--green)":"var(--red)" }}>{fmt(i-e)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
function Settings({ workspace, members, currentMember, onSignOut }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(workspace.invite_code);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  }

  return (
    <div className="page">
      <h1 style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800,marginBottom:24 }}>Configurações</h1>

      <div className="card fade-up" style={{ marginBottom:16 }}>
        <div className="sec-title" style={{ marginBottom:16 }}>Espaço do Casal</div>
        <div style={{ fontSize:14,marginBottom:4 }}><span style={{ color:"var(--text2)" }}>Nome: </span><strong>{workspace.name}</strong></div>
        <div style={{ fontSize:14,marginBottom:16 }}><span style={{ color:"var(--text2)" }}>Membros: </span><strong>{members.length}</strong></div>
        <div className="fl" style={{ marginBottom:8 }}>Código de convite para o parceiro</div>
        <div className="inv-code" style={{ fontSize:22,letterSpacing:4 }}>{workspace.invite_code}</div>
        <button className="btn btn-g" style={{ width:"100%" }} onClick={copy}>{copied?"✅ Copiado!":"📋 Copiar código"}</button>
      </div>

      <div className="card fade-up s1" style={{ marginBottom:16 }}>
        <div className="sec-title" style={{ marginBottom:16 }}>Membros</div>
        {members.map(m=>(
          <div key={m.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)" }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:m.color+"30",color:m.color,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>{m.display_name[0]}</div>
            <div>
              <div style={{ fontWeight:500 }}>{m.display_name}</div>
              <div style={{ fontSize:12,color:"var(--text2)" }}>{m.role==="owner"?"Proprietário":"Membro"}</div>
            </div>
            {m.user_id===currentMember?.user_id&&<span className="badge blue" style={{ marginLeft:"auto" }}>Você</span>}
          </div>
        ))}
      </div>

      <div className="card fade-up s2">
        <div className="sec-title" style={{ marginBottom:16 }}>Conta</div>
        <button className="btn btn-d" style={{ width:"100%" }} onClick={onSignOut}>🚪 Sair da conta</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers]     = useState([]);
  const [txs, setTxs]             = useState([]);
  const [goals, setGoals]         = useState([]);
  const [page, setPage]           = useState("dashboard");
  const [showNewTx, setShowNewTx] = useState(false);
  const [toasts, setToasts]       = useState([]);
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState([now.getFullYear(), now.getMonth()]);
  const channelRef = useRef(null);

  function addToast(msg, type="success") {
    const id = genId();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  }

  // Auth listener
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setSession(session);
      setLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);

  // Load workspace
  useEffect(()=>{
    if(!session) return;
    loadWorkspace();
  },[session]);

  async function loadWorkspace() {
    const { data: memberships } = await supabase.from("workspace_members").select("*").eq("user_id", session.user.id);
    if(!memberships||memberships.length===0) { setWorkspace(null); setLoading(false); return; }
    const wsId = memberships[0].workspace_id;
    const { data: ws } = await supabase.from("workspaces").select("*").eq("id",wsId).single();
    const { data: allMembers } = await supabase.from("workspace_members").select("*").eq("workspace_id",wsId);
    setWorkspace(ws);
    setMembers(allMembers||[]);
    await loadData(wsId);
    setupRealtime(wsId);
  }

  async function loadData(wsId) {
    const id = wsId || workspace?.id;
    if(!id) return;
    const [{ data: txData }, { data: goalData }] = await Promise.all([
      supabase.from("transactions").select("*").eq("workspace_id",id).order("date",{ascending:false}),
      supabase.from("goals").select("*").eq("workspace_id",id).order("created_at"),
    ]);
    setTxs(txData||[]);
    setGoals(goalData||[]);
  }

  function setupRealtime(wsId) {
    if(channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase.channel(`ws:${wsId}`)
      .on("postgres_changes",{ event:"*",schema:"public",table:"transactions",filter:`workspace_id=eq.${wsId}` },
        () => loadData(wsId))
      .on("postgres_changes",{ event:"*",schema:"public",table:"goals",filter:`workspace_id=eq.${wsId}` },
        () => loadData(wsId))
      .subscribe();
    channelRef.current = ch;
  }

  async function saveTx(tx) {
    const { error } = await supabase.from("transactions").insert({
      ...tx, workspace_id: workspace.id, user_id: session.user.id
    });
    if(error) { addToast("Erro ao salvar","error"); return; }
    setShowNewTx(false);
    addToast(`${tx.type==="income"?"Receita":"Despesa"} de ${fmt(tx.amount)} lançada!`);
  }

  async function deleteTx(id) {
    await supabase.from("transactions").delete().eq("id",id);
    addToast("Transação removida");
  }

  function changeMonth(dir) {
    setCurrentMonth(([y,m])=>{
      let nm=m+dir, ny=y;
      if(nm<0){nm=11;ny--;} if(nm>11){nm=0;ny++;}
      return [ny,nm];
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setWorkspace(null); setTxs([]); setGoals([]); setMembers([]);
  }

  const currentMember = members.find(m => m.user_id === session?.user?.id);

  const navItems = [
    { id:"dashboard",    icon:"📊", label:"Dashboard" },
    { id:"transactions", icon:"💸", label:"Transações" },
    { id:"cards",        icon:"💳", label:"Cartões" },
    { id:"goals",        icon:"🎯", label:"Metas" },
    { id:"reports",      icon:"📈", label:"Relatórios" },
    { id:"settings",     icon:"⚙️",  label:"Configurações" },
  ];
  const pageLabels = { dashboard:"Dashboard",transactions:"Transações",cards:"Cartões",goals:"Metas",reports:"Relatórios",settings:"Configurações" };

  const cardAlerts = (() => {
    const [y,m]=currentMonth;
    const mTxs=txs.filter(t=>{const d=new Date(t.date+"T12:00");return d.getFullYear()===y&&d.getMonth()===m;});
    return CREDIT_CARDS_DEFAULT.filter(c=>{ const u=mTxs.filter(t=>t.credit_card_id===c.id).reduce((s,t)=>s+Number(t.amount),0); return u/c.limit>0.8; }).length;
  })();

  // ── render ──
  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loading-screen">
        <div style={{ fontFamily:"var(--font-d)",fontSize:24,fontWeight:800 }}>Fin<span style={{ color:"var(--green)" }}>Duo</span></div>
        <div className="spinner" />
      </div>
    </>
  );

  if (!session) return (
    <>
      <style>{css}</style>
      <AuthScreen onAuth={() => {}} />
    </>
  );

  if (!workspace) return (
    <>
      <style>{css}</style>
      <Onboarding user={session.user} onDone={loadWorkspace} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* sidebar */}
        <nav className="sidebar">
          <div className="logo">
            <div className="logo-mark">
              <div className="logo-icon">F</div>
              <div className="logo-text">Fin<span>Duo</span></div>
            </div>
            <div className="ws-badge">
              <div className="ws-avs">
                {members.map(m=>(
                  <div key={m.id} className="ws-av" style={{ background:m.color+"30",color:m.color }}>{m.display_name[0]}</div>
                ))}
              </div>
              <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{workspace.name}</span>
              <div className="rt-dot" style={{ marginLeft:"auto",flexShrink:0 }} />
            </div>
          </div>

          <div className="nav-lbl">Principal</div>
          {navItems.map(n=>(
            <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
              {n.id==="cards"&&cardAlerts>0&&<span className="nav-badge">{cardAlerts}</span>}
            </div>
          ))}

          <div className="sidebar-foot">
            <div className="user-pill">
              <div className="uav" style={{ width:32,height:32,background:currentMember?.color+"30"||"#222",color:currentMember?.color||"var(--green)",fontSize:13 }}>
                {currentMember?.display_name?.[0]||"?"}
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:500 }}>{currentMember?.display_name}</div>
                <div style={{ fontSize:11,color:"var(--text2)" }}>{currentMember?.role==="owner"?"Proprietário":"Membro"}</div>
              </div>
            </div>
          </div>
        </nav>

        <main className="main">
          <div className="topbar">
            <div className="topbar-title">{pageLabels[page]}</div>
            <div className="topbar-actions">
              <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--text2)" }}>
                <div className="rt-dot" /><span>Ao vivo</span>
              </div>
              <div style={{ display:"flex" }}>
                {members.map(m=>(
                  <div key={m.id} style={{ width:28,height:28,borderRadius:"50%",background:m.color+"30",color:m.color,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,border:"2px solid var(--bg)",marginRight:-4 }}>{m.display_name[0]}</div>
                ))}
              </div>
              <button className="btn btn-p btn-sm" onClick={()=>setShowNewTx(true)}>+ Lançar</button>
            </div>
          </div>

          {page==="dashboard"    && <Dashboard txs={txs} goals={goals} members={members} currentMonth={currentMonth} onMonthChange={changeMonth} />}
          {page==="transactions" && <Transactions txs={txs} members={members} onDelete={deleteTx} currentMonth={currentMonth} onMonthChange={changeMonth} />}
          {page==="cards"        && <Cards txs={txs} members={members} currentMonth={currentMonth} />}
          {page==="goals"        && <Goals goals={goals} workspaceId={workspace.id} onRefresh={()=>loadData()} />}
          {page==="reports"      && <Reports txs={txs} members={members} />}
          {page==="settings"     && <Settings workspace={workspace} members={members} currentMember={currentMember} onSignOut={signOut} />}
        </main>
      </div>

      <button className="fab" onClick={()=>setShowNewTx(true)}>+</button>

      {showNewTx && <NewTxModal onClose={()=>setShowNewTx(false)} onSave={saveTx} />}

      <Toast toasts={toasts} />
    </>
  );
}
