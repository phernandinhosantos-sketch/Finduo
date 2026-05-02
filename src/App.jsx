import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// - SUPABASE -
const SUPABASE_URL = "https://winfxmdkqjpwpgthuhgt.supabase.co";
const SUPABASE_KEY = "sb_publishable_nOFyGui_zLkBI7bm3SI8Gg_gwiazc50";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// - CONSTANTS -
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
  { id: "cc1",                 name: "Itau 2130",        limit: 8165.00,  closingDay: 3, dueDay: 10, color: "#f59e0b" },
  { id: "cc2",                 name: "Itau 0087",        limit: 4000.00,  closingDay: 3, dueDay: 10, color: "#fb923c" },
  { id: "cc_santander_debora", name: "Santander 2569",   limit: 10897.74, closingDay: 3, dueDay: 10, color: "#ef4444" },
];

const MONTHS      = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const USER_COLORS = ["#00e5a0","#4d9fff","#f59e0b","#ff6b9d","#a29bfe"];

// - HELPERS -
const fmt = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n||0);
const fmtDate = iso => { const d=new Date(iso); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`; };
const getCat  = id => CATEGORIES.find(c=>c.id===id) || CATEGORIES[CATEGORIES.length-1];
const getCard = id => CREDIT_CARDS_DEFAULT.find(c=>c.id===id);
const genId   = () => Math.random().toString(36).slice(2,10);

// - CSS -
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
