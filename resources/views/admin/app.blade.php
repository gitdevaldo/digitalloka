<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>DigitalLoka — Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
/* ============================================================ TOKENS */
:root {
  --background: #FFFDF5;
  --foreground: #1E293B;
  --muted: #F1F5F9;
  --muted-foreground: #64748B;
  --accent: #8B5CF6;
  --accent-foreground: #FFFFFF;
  --secondary: #F472B6;
  --tertiary: #FBBF24;
  --quaternary: #34D399;
  --border: #E2E8F0;
  --input: #FFFFFF;
  --card: #FFFFFF;
  --shadow: #1E293B;
  --font-h: 'Outfit', sans-serif;
  --font-b: 'Plus Jakarta Sans', sans-serif;
  --r-sm: 8px; --r-md: 14px; --r-lg: 18px; --r-xl: 20px;
  --ease: cubic-bezier(0.34,1.56,0.64,1);
  --sidebar-w: 240px;
  --sidebar-c: 64px;
  --topbar-h: 64px;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;overflow:hidden;}
body{font-family:var(--font-b);background:var(--background);color:var(--foreground);}

/* dot bg */
body::before{
  content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(30,41,59,0.1) 1px,transparent 1px);
  background-size:22px 22px;
}

/* ============================================================ SCROLLBAR */
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:999px;}

/* ============================================================ TOPBAR */
.topbar{
  position:fixed;top:0;left:0;right:0;height:var(--topbar-h);
  background:var(--card);border-bottom:2px solid var(--foreground);
  box-shadow:0 4px 0 var(--shadow);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 20px 0 0;z-index:300;
}
.topbar-brand{
  width:var(--sidebar-w);flex-shrink:0;
  display:flex;align-items:center;padding:0 16px;gap:10px;
  border-right:2px solid var(--foreground);height:100%;
  transition:width 0.25s var(--ease);overflow:hidden;
}
.app.collapsed .topbar-brand{width:var(--sidebar-c);}

.brand-logo{
  display:flex;align-items:center;text-decoration:none;
  font-family:var(--font-h);font-weight:900;font-size:1.05rem;letter-spacing:-0.03em;flex-shrink:0;
}
.brand-box{
  background:var(--accent);color:#fff;
  border:2px solid var(--foreground);
  box-shadow:3px 3px 0 var(--shadow);
  padding:3px 9px;border-radius:var(--r-sm);white-space:nowrap;
}
.brand-box .loka{color:var(--tertiary);}
.admin-pill{
  background:rgba(244,114,182,0.12);border:2px solid var(--secondary);
  color:var(--secondary);font-size:0.6rem;font-weight:800;
  text-transform:uppercase;letter-spacing:0.08em;
  padding:2px 8px;border-radius:999px;flex-shrink:0;white-space:nowrap;
  box-shadow:2px 2px 0 var(--shadow);
  transition:opacity 0.15s,width 0.25s;
}
.app.collapsed .admin-pill{opacity:0;width:0;overflow:hidden;padding:0;border:none;}

.topbar-center{flex:1;padding:0 20px;}
.search-wrap{
  display:flex;align-items:center;gap:8px;
  background:var(--input);border:2px solid var(--border);
  border-radius:999px;padding:7px 14px;max-width:300px;
  transition:border-color 0.2s,box-shadow 0.2s;
}
.search-wrap:focus-within{border-color:var(--accent);box-shadow:3px 3px 0 var(--accent);}
.search-wrap input{
  border:none;outline:none;background:transparent;
  font-family:var(--font-b);font-size:0.8rem;font-weight:500;color:var(--foreground);width:200px;
}
.search-wrap input::placeholder{color:var(--muted-foreground);}

.topbar-right{display:flex;align-items:center;gap:8px;}
.icon-btn{
  width:36px;height:36px;border-radius:50%;
  border:2px solid var(--border);background:var(--card);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--muted-foreground);transition:all 0.15s var(--ease);position:relative;
}
.icon-btn:hover{border-color:var(--foreground);box-shadow:2px 2px 0 var(--shadow);color:var(--foreground);transform:translate(-1px,-1px);}
.notif-dot{
  position:absolute;top:2px;right:2px;width:8px;height:8px;
  background:var(--secondary);border:2px solid var(--card);border-radius:50%;
}
.avatar{
  width:36px;height:36px;border-radius:50%;
  background:linear-gradient(135deg,var(--accent),var(--secondary));
  border:2px solid var(--foreground);box-shadow:2px 2px 0 var(--shadow);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-h);font-weight:800;font-size:0.85rem;color:#fff;
  cursor:pointer;transition:all 0.15s var(--ease);
}
.avatar:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--shadow);}

/* ============================================================ APP LAYOUT */
.app{display:flex;height:100vh;padding-top:var(--topbar-h);position:relative;z-index:1;}

/* ============================================================ SIDEBAR */
.sidebar{
  width:var(--sidebar-w);flex-shrink:0;
  height:calc(100vh - var(--topbar-h));
  border-right:2px solid var(--foreground);
  background:var(--card);
  display:flex;flex-direction:column;
  transition:width 0.25s var(--ease);overflow:hidden;
  position:relative;z-index:100;
}
.sidebar.collapsed{width:var(--sidebar-c);}

.sidebar-toggle{
  position:absolute;top:16px;right:-14px;
  width:28px;height:28px;border-radius:50%;
  background:var(--card);border:2px solid var(--foreground);
  box-shadow:2px 2px 0 var(--shadow);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;z-index:110;color:var(--foreground);
  transition:all 0.2s var(--ease);
}
.sidebar-toggle:hover{background:var(--accent);color:#fff;border-color:var(--accent);}
.sidebar-toggle svg{transition:transform 0.25s var(--ease);}
.sidebar.collapsed .sidebar-toggle svg{transform:rotate(180deg);}

.sidebar-nav{
  flex:1;overflow-y:auto;overflow-x:hidden;
  padding:14px 10px 10px;display:flex;flex-direction:column;gap:2px;
}

.nav-group-label{
  font-size:0.62rem;font-weight:800;text-transform:uppercase;
  letter-spacing:0.1em;color:var(--muted-foreground);padding:10px 8px 4px;
  white-space:nowrap;transition:opacity 0.15s;
}
.sidebar.collapsed .nav-group-label{opacity:0;}

.nav-item{
  display:flex;align-items:center;gap:10px;padding:9px 10px;
  border-radius:var(--r-md);cursor:pointer;border:2px solid transparent;
  transition:all 0.15s var(--ease);white-space:nowrap;overflow:hidden;
  min-height:42px;position:relative;text-decoration:none;
  color:var(--foreground);font-size:0.83rem;font-weight:600;
}
.nav-item:hover{background:var(--muted);border-color:var(--border);}
.nav-item.active{
  background:var(--accent);color:#fff;
  border-color:var(--foreground);
  box-shadow:3px 3px 0 var(--shadow);
  transform:translate(-1px,-1px);
}
.nav-item.active .nav-ico{color:#fff;}
.nav-item.active .nav-txt{color:#fff;}

.nav-ico{
  width:18px;height:18px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  color:var(--muted-foreground);transition:color 0.15s;
}
.nav-item:hover .nav-ico{color:var(--foreground);}

.nav-txt{flex:1;transition:opacity 0.15s;overflow:hidden;color:var(--foreground);}
.sidebar.collapsed .nav-txt{opacity:0;width:0;}

/* count badge on nav */
.nav-badge{
  flex-shrink:0;background:var(--secondary);color:#fff;
  border:2px solid var(--foreground);border-radius:999px;
  font-size:0.6rem;font-weight:800;padding:0px 6px;
  box-shadow:1px 1px 0 var(--shadow);
  transition:opacity 0.15s;
}
.sidebar.collapsed .nav-badge{opacity:0;width:0;overflow:hidden;padding:0;border:none;}

/* warning dot on nav */
.nav-dot{
  width:8px;height:8px;border-radius:50%;background:var(--tertiary);
  border:2px solid var(--foreground);flex-shrink:0;
  transition:opacity 0.15s;
}
.sidebar.collapsed .nav-dot{opacity:0;width:0;border:none;}

/* tooltip when collapsed */
.nav-item[data-tip]:hover::after{
  content:attr(data-tip);
  position:absolute;left:calc(100% + 12px);top:50%;transform:translateY(-50%);
  background:var(--foreground);color:#fff;font-size:0.72rem;font-weight:700;
  padding:5px 10px;border-radius:var(--r-sm);white-space:nowrap;
  pointer-events:none;z-index:999;box-shadow:2px 2px 0 rgba(0,0,0,0.2);
}

/* bottom sticky */
.sidebar-bottom{
  border-top:2px solid var(--border);padding:10px 10px 14px;
  display:flex;flex-direction:column;gap:2px;flex-shrink:0;
}

/* ============================================================ MAIN */
.main{
  flex:1;height:calc(100vh - var(--topbar-h));
  overflow-y:auto;overflow-x:hidden;padding:32px;min-width:0;
}

/* ============================================================ PAGES */
.page{display:none;}
.page.active{display:block;animation:fadeUp 0.28s var(--ease);}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

/* ============================================================ PAGE HEADER */
.ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;}
.ph-title{font-family:var(--font-h);font-size:1.75rem;font-weight:900;color:var(--foreground);line-height:1.1;}
.ph-sub{font-size:0.8rem;font-weight:500;color:var(--muted-foreground);margin-top:4px;}
.ph-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}

/* ============================================================ BUTTONS */
.btn{
  font-family:var(--font-b);font-weight:700;font-size:0.8rem;
  border:2px solid var(--foreground);border-radius:999px;
  padding:8px 18px;cursor:pointer;
  transition:all 0.15s var(--ease);
  display:inline-flex;align-items:center;gap:6px;
  text-decoration:none;background:var(--card);color:var(--foreground);
  box-shadow:3px 3px 0 var(--shadow);
}
.btn:hover{transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--shadow);}
.btn:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--shadow);}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none !important;box-shadow:none !important;}
.btn-accent{background:var(--accent);color:#fff;}
.btn-danger{background:var(--secondary);color:#fff;}
.btn-success{background:var(--quaternary);color:var(--foreground);}
.btn-warn{background:var(--tertiary);color:var(--foreground);}
.btn-ghost{background:var(--muted);border-color:var(--border);box-shadow:2px 2px 0 var(--border);}
.btn-ghost:hover{box-shadow:3px 3px 0 var(--border);}
.btn-sm{padding:5px 12px;font-size:0.72rem;box-shadow:2px 2px 0 var(--shadow);}
.btn-sm:hover{box-shadow:3px 3px 0 var(--shadow);}

/* ============================================================ STATS GRID */
.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;margin-bottom:24px;}
.stat-card{
  background:var(--card);border:2px solid var(--foreground);border-radius:var(--r-xl);
  padding:20px;position:relative;overflow:hidden;
  transition:all 0.15s var(--ease);
  box-shadow:4px 4px 0 var(--shadow);
  animation:fadeUp 0.3s var(--ease) both;
}
.stat-card:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--shadow);}
.stat-card::after{
  content:'';position:absolute;top:-16px;right:-16px;
  width:56px;height:56px;border-radius:50%;border:2px solid var(--foreground);opacity:0.06;
}
.stat-icon{
  width:36px;height:36px;border-radius:var(--r-sm);border:2px solid var(--foreground);
  display:flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:1rem;
  box-shadow:2px 2px 0 var(--shadow);
}
.stat-lbl{font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.09em;color:var(--muted-foreground);margin-bottom:3px;}
.stat-val{font-family:var(--font-h);font-size:1.8rem;font-weight:900;color:var(--foreground);line-height:1;}
.stat-sub{font-size:0.68rem;font-weight:600;color:var(--muted-foreground);margin-top:4px;}

/* ============================================================ PANEL */
.panel{
  background:var(--card);border:2px solid var(--foreground);border-radius:14px;
  overflow:hidden;margin-bottom:20px;box-shadow:4px 4px 0 var(--shadow);
}
.panel-hd{
  padding:14px 20px;border-bottom:2px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;gap:12px;
}
.panel-title{font-family:var(--font-h);font-size:1rem;font-weight:800;color:var(--foreground);}
.panel-body{padding:20px;}
.table-panel-body{padding:16px;}

/* ============================================================ TABLE */
.table-shell{width:100%;overflow-x:auto;}
.table-shell--admin{
  padding:4px 6px 6px;
  border-radius:8px;
}

.psm-import-wrap{
  background:var(--muted);
  border:2px solid var(--border);
  border-radius:10px;
  padding:18px;
  margin:18px 24px 16px;
}

.psm-form-grid{display:grid;gap:12px;}
.psm-form-actions{
  display:flex;
  justify-content:flex-end;
  gap:10px;
  flex-wrap:wrap;
  margin-top:12px;
  padding-top:10px;
  border-top:1px solid var(--border);
}

.create-product-form{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
  padding:20px;
}

.cp-type-fields{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}

.psm-import-wrap .setting-input{
  padding:10px 12px;
}

.tbl{width:100%;border-collapse:separate;border-spacing:0;}
.tbl th{
  text-align:left;font-size:0.62rem;font-weight:800;text-transform:uppercase;
  letter-spacing:0.09em;color:var(--muted-foreground);padding:10px 10px;
  border-bottom:2px solid var(--border);white-space:nowrap;
}
.tbl td{
  padding:10px 10px;font-size:0.8rem;font-weight:500;line-height:1.25;
  border-bottom:1px solid var(--border);vertical-align:middle;color:var(--foreground);
}
.tbl th:first-child,.tbl td:first-child{padding-left:12px;}
.tbl th:last-child,.tbl td:last-child{padding-right:12px;}
.tbl tr:last-child td{border-bottom:none;}
.tbl tr:hover td{background:var(--muted);}
.tbl .mono{font-family:monospace;font-size:0.72rem;color:var(--muted-foreground);}
.tbl .fw{font-weight:700;color:var(--foreground);}

/* ============================================================ BADGES */
.badge{
  display:inline-flex;align-items:center;gap:4px;padding:3px 9px;
  border-radius:999px;font-size:0.62rem;font-weight:800;text-transform:uppercase;
  letter-spacing:0.05em;border:2px solid var(--foreground);white-space:nowrap;
  box-shadow:2px 2px 0 var(--shadow);
}
.badge .dot{width:6px;height:6px;border-radius:50%;}
.b-green{background:var(--quaternary);color:var(--foreground);}
.b-green .dot{background:#065f46;}
.b-pink{background:var(--secondary);color:#fff;}
.b-pink .dot{background:#9f1239;}
.b-amber{background:var(--tertiary);color:var(--foreground);}
.b-amber .dot{background:#78350f;}
.b-purple{background:var(--accent);color:#fff;}
.b-purple .dot{background:#ede9fe;}
.b-muted{background:var(--muted);color:var(--muted-foreground);border-color:var(--border);box-shadow:none;}
.b-muted .dot{background:var(--muted-foreground);}

/* type pill */
.tag{
  display:inline-flex;align-items:center;padding:2px 8px;
  background:var(--muted);border:1.5px solid var(--border);
  border-radius:999px;font-size:0.65rem;font-weight:700;color:var(--muted-foreground);
}

/* ============================================================ FILTER BAR */
.filter-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.filter-select{
  border:2px solid var(--border);border-radius:var(--r-sm);padding:6px 10px;
  font-family:var(--font-b);font-size:0.75rem;font-weight:600;
  background:var(--input);color:var(--foreground);cursor:pointer;
}
.filter-select:focus{outline:none;border-color:var(--accent);box-shadow:2px 2px 0 var(--accent);}
.filter-input{
  border:2px solid var(--border);border-radius:var(--r-sm);padding:6px 12px;
  font-family:var(--font-b);font-size:0.75rem;font-weight:500;
  background:var(--input);color:var(--foreground);
}
.filter-input:focus{outline:none;border-color:var(--accent);box-shadow:2px 2px 0 var(--accent);}
.filter-input::placeholder{color:var(--muted-foreground);}

/* ============================================================ ACT GROUP */
.act-group{display:flex;gap:4px;flex-wrap:wrap;}

/* ============================================================ GRID */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;}

/* ============================================================ AUDIT ROW */
.audit-row td:first-child{border-left:3px solid transparent;padding-left:9px;}
.audit-row.ok td:first-child{border-left-color:var(--quaternary);}
.audit-row.fail td:first-child{border-left-color:var(--secondary);}
.audit-row.warn td:first-child{border-left-color:var(--tertiary);}

/* ============================================================ SETTINGS */
.setting-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:13px 0;border-bottom:1px solid var(--border);gap:16px;
}
.setting-row:last-child{border-bottom:none;}
.setting-key{font-size:0.83rem;font-weight:700;color:var(--foreground);}
.setting-desc{font-size:0.72rem;font-weight:500;color:var(--muted-foreground);margin-top:2px;}
.setting-input{
  border:2px solid var(--border);border-radius:var(--r-sm);padding:6px 10px;
  font-family:var(--font-b);font-size:0.78rem;font-weight:600;
  background:var(--input);color:var(--foreground);
}
.setting-input:focus{outline:none;border-color:var(--accent);box-shadow:2px 2px 0 var(--accent);}
.setting-select{
  border:2px solid var(--border);border-radius:var(--r-sm);padding:6px 10px;
  font-family:var(--font-b);font-size:0.78rem;font-weight:600;
  background:var(--input);color:var(--foreground);cursor:pointer;
}

/* ============================================================ TOGGLE */
.toggle{position:relative;width:38px;height:22px;flex-shrink:0;}
.toggle input{opacity:0;width:0;height:0;}
.toggle-slider{
  position:absolute;inset:0;background:var(--border);border-radius:999px;
  cursor:pointer;transition:background 0.2s;border:2px solid var(--foreground);
}
.toggle-slider::before{
  content:'';position:absolute;width:14px;height:14px;
  left:2px;top:2px;background:var(--muted-foreground);border-radius:50%;
  transition:transform 0.2s var(--ease);
}
.toggle input:checked+.toggle-slider{background:var(--quaternary);}
.toggle input:checked+.toggle-slider::before{transform:translateX(14px);background:var(--foreground);}

/* ============================================================ EMPTY */
.empty{
  text-align:center;padding:52px 24px;
  border:2px dashed var(--border);border-radius:var(--r-xl);
  background:var(--muted);
}
.empty-ico{font-size:2.4rem;margin-bottom:10px;}
.empty-ttl{font-family:var(--font-h);font-size:1.05rem;font-weight:800;margin-bottom:6px;}
.empty-txt{font-size:0.8rem;color:var(--muted-foreground);font-weight:500;}

/* ============================================================ MODAL */
.modal-bg{
  position:fixed;inset:0;background:rgba(30,41,59,0.45);z-index:500;
  display:none;align-items:center;justify-content:center;backdrop-filter:blur(3px);
}
.modal-bg.open{display:flex;}
.modal{
  background:var(--card);border:2px solid var(--foreground);border-radius:var(--r-xl);
  box-shadow:8px 8px 0 var(--shadow);
  padding:24px;max-width:520px;width:90%;max-height:80vh;overflow-y:auto;
  animation:fadeUp 0.25s var(--ease);
}
.modal-title{font-family:var(--font-h);font-size:1rem;font-weight:800;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}
.modal pre{
  background:var(--muted);border:2px solid var(--border);border-radius:var(--r-sm);
  padding:14px;font-size:0.72rem;color:var(--foreground);line-height:1.6;
  overflow-x:auto;white-space:pre-wrap;
}

/* ============================================================ TOAST */
#toast{
  position:fixed;bottom:24px;right:24px;z-index:9999;
  background:var(--foreground);color:#fff;
  border:2px solid var(--foreground);border-radius:var(--r-md);
  padding:12px 18px;font-size:0.8rem;font-weight:700;
  box-shadow:4px 4px 0 rgba(0,0,0,0.2);
  display:none;align-items:center;gap:8px;max-width:300px;
  animation:fadeUp 0.25s var(--ease);
}

/* ============================================================ QUEUE CARDS */
.queue-card{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 16px;border:2px solid var(--foreground);border-radius:var(--r-lg);
  box-shadow:3px 3px 0 var(--shadow);margin-bottom:10px;
  transition:all 0.15s var(--ease);
}
.queue-card:hover{transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--shadow);}
.queue-card:last-child{margin-bottom:0;}

/* ============================================================ ANIM DELAYS */
.stat-card:nth-child(1){animation-delay:.03s;}
.stat-card:nth-child(2){animation-delay:.06s;}
.stat-card:nth-child(3){animation-delay:.09s;}
.stat-card:nth-child(4){animation-delay:.12s;}
.stat-card:nth-child(5){animation-delay:.15s;}
.stat-card:nth-child(6){animation-delay:.18s;}
.stat-card:nth-child(7){animation-delay:.21s;}
.stat-card:nth-child(8){animation-delay:.24s;}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;}}
@media(max-width:900px){
  .sidebar{
    position:fixed;top:var(--topbar-h);left:0;bottom:0;z-index:260;
    width:min(84vw,320px);
    transform:translateX(-102%);
    box-shadow:6px 0 0 var(--shadow);
  }
  .sidebar.open{transform:translateX(0);}
  .main{padding:14px;}
  .grid-2,.grid-3{grid-template-columns:1fr;}
  .stats-grid{grid-template-columns:1fr;}
  .topbar-center{display:none;}
  .ph-actions{width:100%;}
  .filter-bar{overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px;}
  .filter-input,.filter-select{flex:0 0 auto;}
  .filter-input{min-width:170px;}
  .nav-item[data-tip]:hover::after{display:none;}
  .create-product-form{grid-template-columns:1fr;padding:14px;}
  .cp-type-fields{grid-template-columns:1fr;}
  .psm-import-wrap{margin:12px;}
  .panel-body{padding:14px;}
}
@media(max-width:600px){
  .main{padding:12px;}
  .panel-hd{padding:12px 14px;}
  .tbl th,.tbl td{padding-top:8px;padding-bottom:8px;}
  .tbl th:first-child,.tbl td:first-child{padding-left:10px;}
  .tbl th:last-child,.tbl td:last-child{padding-right:10px;}
  .psm-form-actions{justify-content:flex-start;}
}
</style>
</head>
<body>
@php
  $initialPageValue = $initialPage ?? 'overview';
  $initialProductTypeValue = $initialProductType ?? null;
  $initialStockProductIdValue = $initialStockProductId ?? null;
@endphp

<!-- ============================================================ TOPBAR -->
<x-layout.topbar variant="admin" />

<!-- ============================================================ APP -->
<div class="app" id="app">

<!-- SIDEBAR -->
<x-layout.sidebar-shell id="sidebar" toggle-id="sbToggle" toggle-title="Toggle sidebar" toggle-size="11">

  <nav class="sidebar-nav">
    <div class="nav-group-label">Main</div>

    <div class="nav-item active" data-page="overview" data-tip="Overview" onclick="nav('overview',this)">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
      <span class="nav-txt">Overview</span>
    </div>

    <div class="nav-item" data-page="products" data-tip="Products" onclick="nav('products',this)">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></span>
      <span class="nav-txt">Products</span>
    </div>

    <div class="nav-item" data-page="product-types" data-tip="Product Types" onclick="nav('product-types',this)" style="padding-left:28px;min-height:38px">
      <span class="nav-ico"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/></svg></span>
      <span class="nav-txt">Product Types</span>
    </div>

    <div class="nav-item" data-page="product-stocks" data-tip="Product Stocks" onclick="openProductStocksFromMenu(this)" style="padding-left:28px;min-height:38px">
      <span class="nav-ico"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg></span>
      <span class="nav-txt">Product Stocks</span>
    </div>

    <div class="nav-item" data-page="orders" data-tip="Orders" onclick="nav('orders',this)">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
      <span class="nav-txt">Orders</span>
      <span class="nav-badge" id="nav-orders-badge" style="display:none">0</span>
    </div>

    <div class="nav-item" data-page="users" data-tip="Users" onclick="nav('users',this)">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
      <span class="nav-txt">Users</span>
    </div>

    <div class="nav-item" data-page="entitlements" data-tip="Entitlements" onclick="nav('entitlements',this)">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span>
      <span class="nav-txt">Entitlements</span>
      <span class="nav-dot" id="nav-entitlements-dot" style="display:none"></span>
    </div>

    <div class="nav-item" data-page="droplets" data-tip="Droplets" onclick="nav('droplets',this)">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg></span>
      <span class="nav-txt">Droplets</span>
    </div>

    <div class="nav-item" data-page="audit" data-tip="Audit Logs" onclick="nav('audit',this)">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="12" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span>
      <span class="nav-txt">Audit Logs</span>
    </div>

    <div class="nav-item" data-page="settings" data-tip="Settings" onclick="nav('settings',this)">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
      <span class="nav-txt">Settings</span>
    </div>
  </nav>

  <!-- BOTTOM STICKY -->
  <div class="sidebar-bottom">
    <div class="nav-item" data-page="account" data-tip="Admin Account" onclick="nav('account',this)">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
      <span class="nav-txt">Admin Account</span>
    </div>
    <div class="nav-item" data-page="support" data-tip="Support" onclick="nav('support',this)">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
      <span class="nav-txt">Support</span>
    </div>
    <div class="nav-item" data-tip="Logout" onclick="handleLogout('/admin/login?next=/admin')">
      <span class="nav-ico"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
      <span class="nav-txt">Logout</span>
    </div>
  </div>
</x-layout.sidebar-shell>

<!-- ============================================================ MAIN -->
<main class="main">

<!-- ==================== OVERVIEW ==================== -->
<div class="page active" id="page-overview">
  <x-layout.page-header
    variant="admin"
    title="Admin Overview"
    subtitle="System health and operational snapshot · /admin"
  >
    <x-slot:actions>
      <x-ui.button variant="accent" onclick="nav('audit',document.querySelector('[data-page=audit]'))">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        View Audit Logs
      </x-ui.button>
    </x-slot:actions>
  </x-layout.page-header>

  <div class="stats-grid">
    <div class="stat-card"><div class="stat-icon" style="background:rgba(139,92,246,0.1)">📦</div><div class="stat-lbl">Total Products</div><div class="stat-val" id="stat-products-total">0</div><div class="stat-sub" id="stat-products-sub">0 active</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(52,211,153,0.12)">✅</div><div class="stat-lbl">Active Entitlements</div><div class="stat-val" id="stat-entitlements-active">0</div><div class="stat-sub" id="stat-entitlements-sub">0 expiring soon</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(244,114,182,0.12)">👥</div><div class="stat-lbl">Total Users</div><div class="stat-val" id="stat-users-total">0</div><div class="stat-sub" id="stat-users-sub">0 blocked</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(251,191,36,0.15)">🛒</div><div class="stat-lbl">Total Orders</div><div class="stat-val" id="stat-orders-total">0</div><div class="stat-sub" id="stat-orders-sub">0 pending</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(139,92,246,0.1)">🖥️</div><div class="stat-lbl">Managed Droplets</div><div class="stat-val" id="stat-droplets-total">0</div><div class="stat-sub" id="stat-droplets-sub">0 in action</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(244,114,182,0.12)">⚡</div><div class="stat-lbl">Actions In Progress</div><div class="stat-val" id="stat-actions-progress">0</div><div class="stat-sub" id="stat-actions-sub">0 users affected</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(52,211,153,0.12)">💰</div><div class="stat-lbl">Revenue (MTD)</div><div class="stat-val" id="stat-revenue-mtd">$0.00</div><div class="stat-sub" id="stat-revenue-sub">From paid orders</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(251,191,36,0.15)">📊</div><div class="stat-lbl">Audit Events (24h)</div><div class="stat-val" id="stat-audit-total">0</div><div class="stat-sub" id="stat-audit-sub">0 failures</div></div>
  </div>

  <div class="grid-2">
    <x-ui.panel variant="admin" title="🚨 Critical Audit Events">
      <x-slot:actions>
        <x-ui.button variant="sm" onclick="nav('audit',document.querySelector('[data-page=audit]'))">All logs →</x-ui.button>
      </x-slot:actions>
      <x-ui.table-shell variant="admin">
          <thead><tr><th>Actor</th><th>Action</th><th>Result</th><th>Time</th></tr></thead>
          <tbody id="overview-audit-body"></tbody>
      </x-ui.table-shell>
    </x-ui.panel>

    <div class="panel">
      <div class="panel-hd"><div class="panel-title">⏳ High-Priority Queues</div></div>
      <div class="panel-body">
        <div class="queue-card" style="background:rgba(244,114,182,0.08);">
          <div><div style="font-weight:700;font-size:0.85rem">Pending Orders</div><div style="font-size:0.72rem;color:var(--muted-foreground);margin-top:2px">Awaiting fulfillment</div></div>
          <div style="display:flex;align-items:center;gap:10px">
            <span id="queue-pending-orders" style="font-family:var(--font-h);font-size:1.5rem;font-weight:900;color:var(--secondary)">0</span>
            <button class="btn btn-sm" onclick="nav('orders',document.querySelector('[data-page=orders]'))">Review →</button>
          </div>
        </div>
        <div class="queue-card" style="background:rgba(251,191,36,0.08);">
          <div><div style="font-weight:700;font-size:0.85rem">Expiring Entitlements</div><div style="font-size:0.72rem;color:var(--muted-foreground);margin-top:2px">Expire within 7 days</div></div>
          <div style="display:flex;align-items:center;gap:10px">
            <span id="queue-expiring-entitlements" style="font-family:var(--font-h);font-size:1.5rem;font-weight:900;color:var(--tertiary)">0</span>
            <button class="btn btn-sm" onclick="nav('entitlements',document.querySelector('[data-page=entitlements]'))">Review →</button>
          </div>
        </div>
        <div class="queue-card" style="background:rgba(139,92,246,0.07);">
          <div><div style="font-weight:700;font-size:0.85rem">Droplets In Action</div><div style="font-size:0.72rem;color:var(--muted-foreground);margin-top:2px">Processing or stuck</div></div>
          <div style="display:flex;align-items:center;gap:10px">
            <span id="queue-droplets-action" style="font-family:var(--font-h);font-size:1.5rem;font-weight:900;color:var(--accent)">0</span>
            <button class="btn btn-sm" onclick="nav('droplets',document.querySelector('[data-page=droplets]'))">Review →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ==================== PRODUCTS ==================== -->
<div class="page" id="page-products">
  <x-layout.page-header variant="admin" title="Products" subtitle="/admin/products — full catalog management">
    <x-slot:actions>
      <x-ui.button variant="accent" onclick="nav('product-create', null)">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create Product
      </x-ui.button>
    </x-slot:actions>
  </x-layout.page-header>
  <x-ui.filter-bar>
    <select class="filter-select"><option>All Types</option><option>vps_droplet</option><option>digital</option><option>course</option><option>template</option></select>
    <select class="filter-select"><option>All Statuses</option><option>Active</option><option>Draft</option><option>Archived</option></select>
    <input class="filter-input" placeholder="Search product name or slug…"/>
  </x-ui.filter-bar>
  <x-ui.panel variant="admin">
    <div class="table-panel-body">
      <x-ui.table-shell variant="admin"><thead><tr><th>ID</th><th>Product Name</th><th>Type</th><th>Category</th><th>Visibility</th><th>Pricing</th><th>Updated</th><th>Actions</th></tr></thead><tbody id="products-body"></tbody></x-ui.table-shell>
    </div>
  </x-ui.panel>
</div>

<!-- ==================== CREATE PRODUCT ==================== -->
<div class="page" id="page-product-create">
  <x-layout.page-header variant="admin" title="Create Product" subtitle="/admin/products/create — create catalog item">
    <x-slot:actions>
      <x-ui.button variant="sm" onclick="nav('products', null)">← Back to Products</x-ui.button>
    </x-slot:actions>
  </x-layout.page-header>

  <x-ui.panel variant="admin">
    <form id="create-product-form" class="create-product-form" onsubmit="submitCreateProduct(event)">
      <label style="display:flex;flex-direction:column;gap:6px;grid-column:1 / span 2">
        <span style="font-weight:700;font-size:0.8rem">Product Name</span>
        <input id="cp-name" class="setting-input" required maxlength="150" placeholder="NovaDash UI Kit" />
      </label>

      <label style="display:flex;flex-direction:column;gap:6px;grid-column:1 / span 2">
        <span style="font-weight:700;font-size:0.8rem">Slug</span>
        <input id="cp-slug" class="setting-input" required maxlength="180" placeholder="novadash-ui-kit" />
      </label>

      <label style="display:flex;flex-direction:column;gap:6px">
        <span style="font-weight:700;font-size:0.8rem">Type</span>
        <select id="cp-type" class="setting-select" onchange="renderCreateProductTypeFields(this.value)">
          <option value="digital">digital</option>
          <option value="template">template</option>
          <option value="course">course</option>
          <option value="vps_droplet">vps_droplet</option>
        </select>
      </label>

      <label style="display:flex;flex-direction:column;gap:6px">
        <span style="font-weight:700;font-size:0.8rem">Status</span>
        <select id="cp-status" class="setting-select">
          <option value="available">available</option>
          <option value="out-of-stock">out-of-stock</option>
          <option value="coming-soon">coming-soon</option>
        </select>
      </label>

      <label style="display:flex;flex-direction:column;gap:6px;grid-column:1 / span 2">
        <span style="font-weight:700;font-size:0.8rem">Short Description</span>
        <textarea id="cp-short-description" class="setting-input" rows="4" placeholder="Optional short description"></textarea>
      </label>

      <label style="display:flex;flex-direction:column;gap:6px;grid-column:1 / span 2">
        <span style="font-weight:700;font-size:0.8rem">Catalog Visibility</span>
        <select id="cp-visible" class="setting-select">
          <option value="visible" selected>visible</option>
          <option value="hidden">hidden</option>
        </select>
      </label>

      <div style="grid-column:1 / span 2;border-top:1px solid var(--border);padding-top:10px">
        <div style="font-family:var(--font-h);font-size:0.95rem;font-weight:800;margin-bottom:8px">Type-Specific Fields</div>
        <div id="cp-type-fields" class="cp-type-fields"></div>
      </div>

      <div style="grid-column:1 / span 2;display:flex;justify-content:flex-end;gap:10px;margin-top:8px">
        <button type="button" class="btn btn-ghost" onclick="nav('products', null)">Cancel</button>
        <button id="cp-submit" type="submit" class="btn btn-accent">Create Product</button>
      </div>
    </form>
  </x-ui.panel>
</div>

<!-- ==================== PRODUCT STOCKS ==================== -->
<div class="page" id="page-product-stocks">
  <x-layout.page-header variant="admin" title="Product Stocks" subtitle="/admin/product-stocks — manage account inventory by product">
    <x-slot:actions>
      <x-ui.button variant="sm" onclick="refreshProductStockProducts()">Refresh</x-ui.button>
    </x-slot:actions>
  </x-layout.page-header>

  <x-ui.filter-bar>
    <input class="filter-input" id="ps-product-search" placeholder="Search active products by name/slug/type..." oninput="renderProductStockProducts()"/>
  </x-ui.filter-bar>

  <x-ui.panel variant="admin">
    <x-ui.table-shell variant="admin">
      <thead><tr><th>ID</th><th>Product</th><th>Type</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody id="product-stock-products-body"></tbody>
    </x-ui.table-shell>
  </x-ui.panel>
</div>

<!-- ==================== PRODUCT STOCKS MANAGE ==================== -->
<div class="page" id="page-product-stocks-manage">
  <x-layout.page-header variant="admin" title="Manage Product Stocks" subtitle="/admin/products/{id}/stocks — manage stock entries for selected product">
    <x-slot:actions>
      <x-ui.button variant="sm" onclick="openProductStocksFromMenu(null)">← Back to Product Stocks</x-ui.button>
      <x-ui.button variant="sm" onclick="refreshSelectedProductStocks()">Refresh</x-ui.button>
    </x-slot:actions>
  </x-layout.page-header>

  <x-ui.panel variant="admin" id="ps-stock-management-panel">
    <div class="panel-hd">
      <div class="panel-title">Stock Management: <span id="ps-selected-product-label">-</span></div>
      <div style="display:flex;gap:8px;align-items:center">
        <x-ui.button variant="sm" onclick="openProductStocksImportForm()">Add Stock</x-ui.button>
        <x-ui.button variant="sm" onclick="exportProductStocks()">Export</x-ui.button>
      </div>
    </div>

    <div class="psm-import-wrap" id="psm-import-wrap" style="display:none">
      <div class="psm-form-grid">
        <label style="display:flex;flex-direction:column;gap:6px">
          <span style="font-weight:700;font-size:0.78rem">Headers (| separated)</span>
          <input id="ps-input-headers" class="setting-input" placeholder="Email|Password|Recovery Code" value="Email|Password|Recovery Code" />
        </label>
        <label style="display:flex;flex-direction:column;gap:6px">
          <span style="font-weight:700;font-size:0.78rem">Stock Rows (one row per line, values separated by |)</span>
          <textarea id="ps-input-rows" class="setting-input" rows="5" placeholder="email1@mail.com|pass1|recovery1&#10;email2@mail.com|pass2|recovery2"></textarea>
        </label>
      </div>
      <div class="psm-form-actions">
        <button class="btn btn-sm btn-ghost" onclick="closeProductStocksImportForm()">Close</button>
        <button class="btn btn-sm btn-ghost" onclick="clearProductStocksInput()">Clear</button>
        <button class="btn btn-sm btn-accent" onclick="submitProductStocksBatch()">Add / Import Stocks</button>
      </div>
    </div>

    <div class="panel-body" style="padding:18px 24px 20px">
      <x-ui.filter-bar>
        <select class="filter-select" id="ps-status-filter" onchange="loadProductStocks()">
          <option value="">All Status</option>
          <option value="unsold">unsold</option>
          <option value="sold">sold</option>
        </select>
        <input class="filter-input" id="ps-search" placeholder="Search in credential fields..." oninput="debouncedLoadProductStocks()"/>
      </x-ui.filter-bar>

      <x-ui.table-shell variant="admin">
        <thead><tr><th>ID</th><th>Status</th><th>Credentials</th><th>Added</th><th>Sold</th><th>Actions</th></tr></thead>
        <tbody id="product-stocks-body"></tbody>
      </x-ui.table-shell>
    </div>
  </x-ui.panel>
</div>

<!-- ==================== PRODUCT TYPES ==================== -->
<div class="page" id="page-product-types">
  <x-layout.page-header variant="admin" title="Product Types" subtitle="/admin/product-types — manage schema per product type">
    <x-slot:actions>
      <x-ui.button variant="sm" onclick="refreshProductTypes()">Refresh</x-ui.button>
      <x-ui.button variant="accent" onclick="openProductTypeEditor()">+ Create Type</x-ui.button>
    </x-slot:actions>
  </x-layout.page-header>

  <x-ui.filter-bar>
    <select class="filter-select" id="pt-filter-type" onchange="renderProductTypesPage()">
      <option value="all">All Types</option>
      <option value="vps_only">VPS Only</option>
      <option value="custom_only">Custom Types</option>
    </select>
    <input class="filter-input" id="pt-filter-search" placeholder="Search type key or label..." oninput="renderProductTypesPage()"/>
  </x-ui.filter-bar>

  <x-ui.panel variant="admin">
    <div class="table-panel-body">
      <x-ui.table-shell variant="admin">
        <thead>
          <tr>
            <th>TYPE KEY</th>
            <th>LABEL</th>
            <th>STATUS</th>
            <th>DESCRIPTION</th>
            <th>FIELDS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody id="product-type-list"></tbody>
      </x-ui.table-shell>
    </div>
  </x-ui.panel>

  <x-ui.panel variant="admin" title="DigitalOcean Regional Availability Reference">
    <div class="panel-body" style="padding:16px">
      <a href="https://docs.digitalocean.com/platform/regional-availability/" target="_blank" rel="noopener" class="btn btn-sm">Open DigitalOcean Regional Availability</a>
    </div>
  </x-ui.panel>
</div>

<!-- ==================== PRODUCT TYPE EDITOR ==================== -->
<div class="page" id="page-product-type-editor">
  <x-layout.page-header variant="admin" title="Product Type Editor" subtitle="/admin/product-types/create — create or edit product type schema">
    <x-slot:actions>
      <x-ui.button variant="sm" onclick="nav('product-types', null)">← Back to Product Types</x-ui.button>
      <x-ui.button variant="accent" onclick="saveCurrentProductType()">Save Type</x-ui.button>
    </x-slot:actions>
  </x-layout.page-header>

  <x-ui.panel variant="admin" title="Schema Builder">
    <div class="panel-body" style="padding:22px;display:grid;gap:12px">
      <label style="font-size:0.75rem;font-weight:700">Type Key</label>
      <input id="pt-type-key" class="setting-input" />

      <label style="font-size:0.75rem;font-weight:700">Label</label>
      <input id="pt-label" class="setting-input" />

      <label style="font-size:0.75rem;font-weight:700">Description</label>
      <input id="pt-description" class="setting-input" />

      <label style="display:flex;flex-direction:column;gap:6px;font-size:0.78rem;font-weight:700">
        <span>Status</span>
        <select id="pt-is-active" class="setting-select">
          <option value="active" selected>active</option>
          <option value="inactive">inactive</option>
        </select>
      </label>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
        <label style="font-size:0.75rem;font-weight:700">Fields</label>
        <button type="button" class="btn btn-sm" onclick="addProductTypeField()">+ Add Field</button>
      </div>
      <div id="pt-fields-editor" style="display:grid;gap:10px"></div>
      <div style="font-size:0.72rem;color:var(--muted-foreground)">Tip: For select fields, enter options separated by commas.</div>
    </div>
  </x-ui.panel>
</div>

<!-- ==================== ORDERS ==================== -->
<div class="page" id="page-orders">
  <x-layout.page-header variant="admin" title="Orders" subtitle="/admin/orders — order management and fulfillment" />
  <x-ui.filter-bar>
    <select class="filter-select"><option>All Fulfillment</option><option>Pending</option><option>Active</option><option>Completed</option></select>
    <select class="filter-select"><option>All Payment</option><option>Paid</option><option>Pending</option><option>Refunded</option></select>
    <input class="filter-input" placeholder="Search order ID or user email…"/>
  </x-ui.filter-bar>
  <x-ui.panel variant="admin">
    <x-ui.table-shell variant="admin"><thead><tr><th>Order ID</th><th>User</th><th>Items</th><th>Total</th><th>Payment</th><th>Fulfillment</th><th>Created</th><th>Actions</th></tr></thead><tbody id="orders-body"></tbody></x-ui.table-shell>
  </x-ui.panel>
</div>

<!-- ==================== USERS ==================== -->
<div class="page" id="page-users">
  <x-layout.page-header variant="admin" title="Users" subtitle="/admin/users — user management and access control" />
  <x-ui.filter-bar>
    <select class="filter-select"><option>All Roles</option><option>user</option><option>admin</option></select>
    <select class="filter-select"><option>All Statuses</option><option>Active</option><option>Blocked</option><option>Pending</option></select>
    <input class="filter-input" placeholder="Search email or user ID…"/>
  </x-ui.filter-bar>
  <x-ui.panel variant="admin">
    <x-ui.table-shell variant="admin"><thead><tr><th>User ID</th><th>Email</th><th>Role</th><th>Status</th><th>Products</th><th>Last Active</th><th>Actions</th></tr></thead><tbody id="users-body"></tbody></x-ui.table-shell>
  </x-ui.panel>
</div>

<!-- ==================== ENTITLEMENTS ==================== -->
<div class="page" id="page-entitlements">
  <x-layout.page-header variant="admin" title="Entitlements" subtitle="/admin/entitlements — license and access lifecycle" />
  <x-ui.filter-bar>
    <select class="filter-select"><option>All Statuses</option><option>Active</option><option>Expiring</option><option>Suspended</option><option>Revoked</option></select>
    <input class="filter-input" placeholder="Search user email or product name…"/>
  </x-ui.filter-bar>
  <x-ui.panel variant="admin">
    <x-ui.table-shell variant="admin"><thead><tr><th>ID</th><th>User</th><th>Product</th><th>Order</th><th>Status</th><th>Starts</th><th>Expires</th><th>Actions</th></tr></thead><tbody id="ent-body"></tbody></x-ui.table-shell>
  </x-ui.panel>
</div>

<!-- ==================== DROPLETS ==================== -->
<div class="page" id="page-droplets">
  <x-layout.page-header variant="admin" title="Droplets" subtitle="/admin/droplets — server resource administration">
    <x-slot:actions>
      <x-ui.button variant="sm" onclick="refreshAll()">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Refresh All
      </x-ui.button>
    </x-slot:actions>
  </x-layout.page-header>
  <x-ui.filter-bar>
    <select class="filter-select"><option>All Statuses</option><option>Running</option><option>Stopped</option><option>Starting</option></select>
    <select class="filter-select"><option>All Regions</option><option>SGP1</option><option>NYC1</option><option>FRA1</option></select>
    <input class="filter-input" placeholder="Search droplet ID or owner…"/>
  </x-ui.filter-bar>
  <x-ui.panel variant="admin">
    <x-ui.table-shell variant="admin"><thead><tr><th>Droplet ID</th><th>Owner</th><th>Entitlement</th><th>Region</th><th>Plan</th><th>Status</th><th>IP</th><th>Last Action</th><th>Actions</th></tr></thead><tbody id="droplets-body"></tbody></x-ui.table-shell>
  </x-ui.panel>
</div>

<!-- ==================== AUDIT LOGS ==================== -->
<div class="page" id="page-audit">
  <x-layout.page-header variant="admin" title="Audit Logs" subtitle="/admin/audit-logs — full event history">
    <x-slot:actions>
      <x-ui.button variant="sm" class="btn-ghost">Export CSV</x-ui.button>
    </x-slot:actions>
  </x-layout.page-header>
  <x-ui.filter-bar>
    <select class="filter-select"><option>All Actors</option><option>admin@dl.dev</option><option>system</option></select>
    <select class="filter-select"><option>All Actions</option><option>droplet.*</option><option>entitlement.*</option><option>user.*</option><option>product.*</option><option>order.*</option></select>
    <select class="filter-select"><option>All Results</option><option>ok</option><option>fail</option><option>warn</option></select>
    <input class="filter-input" placeholder="Search target ID or actor…"/>
    <input class="filter-input" type="date" style="width:auto"/>
    <input class="filter-input" type="date" style="width:auto"/>
  </x-ui.filter-bar>
  <x-ui.panel variant="admin">
    <x-ui.table-shell variant="admin"><thead><tr><th>Event ID</th><th>Actor</th><th>Action</th><th>Target Type</th><th>Target ID</th><th>Result</th><th>Timestamp</th><th>Payload</th></tr></thead><tbody id="audit-body"></tbody></x-ui.table-shell>
  </x-ui.panel>
</div>

<!-- ==================== SETTINGS ==================== -->
<div class="page" id="page-settings">
  <div class="ph">
    <div><div class="ph-title">Settings</div><div class="ph-sub">/admin/settings — platform configuration</div></div>
    <div class="ph-actions">
      <button class="btn btn-accent" onclick="saveAllSettings()">Save All Changes</button>
    </div>
  </div>
  <div class="grid-2">
    <div>
      <div class="panel">
        <div class="panel-hd"><div class="panel-title">📦 Catalog Settings</div></div>
        <div class="panel-body">
          <div class="setting-row"><div><div class="setting-key">Default Product Visibility</div><div class="setting-desc">New products created as draft or published</div></div><select class="setting-select" data-setting-group="catalog" data-setting-key="catalog.default_visibility"><option>draft</option><option>published</option></select></div>
          <div class="setting-row"><div><div class="setting-key">Product Slug Format</div><div class="setting-desc">Auto-generated slug style</div></div><input class="setting-input" data-setting-group="catalog" data-setting-key="catalog.slug_format" value="kebab-case" style="width:130px"/></div>
          <div class="setting-row"><div><div class="setting-key">Max Product Images</div><div class="setting-desc">Per product listing</div></div><input class="setting-input" data-setting-group="catalog" data-setting-key="catalog.max_product_images" type="number" value="8" style="width:70px"/></div>
          <div class="setting-row"><div><div class="setting-key">Reviews Enabled</div><div class="setting-desc">Allow users to leave product reviews</div></div><label class="toggle"><input type="checkbox" data-setting-group="catalog" data-setting-key="catalog.reviews_enabled" checked/><span class="toggle-slider"></span></label></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-hd"><div class="panel-title">🔑 Entitlement Defaults</div></div>
        <div class="panel-body">
          <div class="setting-row"><div><div class="setting-key">Default Expiry (days)</div><div class="setting-desc">Applied when no custom expiry is set</div></div><input class="setting-input" data-setting-group="entitlement" data-setting-key="entitlement.default_expiry_days" type="number" value="365" style="width:70px"/></div>
          <div class="setting-row"><div><div class="setting-key">Expiry Warning (days before)</div><div class="setting-desc">Notify user N days before expiry</div></div><input class="setting-input" data-setting-group="entitlement" data-setting-key="entitlement.expiry_warning_days" type="number" value="7" style="width:70px"/></div>
          <div class="setting-row"><div><div class="setting-key">Auto-suspend on Expiry</div><div class="setting-desc">Automatically suspend expired entitlements</div></div><label class="toggle"><input type="checkbox" data-setting-group="entitlement" data-setting-key="entitlement.auto_suspend_on_expiry" checked/><span class="toggle-slider"></span></label></div>
          <div class="setting-row"><div><div class="setting-key">Grace Period (days)</div><div class="setting-desc">Days after expiry before full revocation</div></div><input class="setting-input" data-setting-group="entitlement" data-setting-key="entitlement.grace_period_days" type="number" value="3" style="width:70px"/></div>
        </div>
      </div>
    </div>
    <div>
      <div class="panel">
        <div class="panel-hd"><div class="panel-title">🛒 Order &amp; Fulfillment</div></div>
        <div class="panel-body">
          <div class="setting-row"><div><div class="setting-key">Auto-fulfill Digital Orders</div><div class="setting-desc">Grant access immediately after payment</div></div><label class="toggle"><input type="checkbox" data-setting-group="order" data-setting-key="order.auto_fulfill_digital" checked/><span class="toggle-slider"></span></label></div>
          <div class="setting-row"><div><div class="setting-key">Currency</div><div class="setting-desc">Default storefront currency</div></div><select class="setting-select" data-setting-group="order" data-setting-key="order.currency"><option>USD</option><option>IDR</option><option>EUR</option></select></div>
          <div class="setting-row"><div><div class="setting-key">Refund Window (days)</div><div class="setting-desc">Days a customer can request a refund</div></div><input class="setting-input" data-setting-group="order" data-setting-key="order.refund_window_days" type="number" value="14" style="width:70px"/></div>
          <div class="setting-row"><div><div class="setting-key">Order ID Prefix</div><div class="setting-desc">Prefix for all generated order IDs</div></div><input class="setting-input" data-setting-group="order" data-setting-key="order.id_prefix" value="ORD-" style="width:90px"/></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-hd"><div class="panel-title">📧 Operational Contacts</div></div>
        <div class="panel-body">
          <div class="setting-row"><div><div class="setting-key">Billing Email</div><div class="setting-desc">Receives billing alerts and invoices</div></div><input class="setting-input" data-setting-group="contact" data-setting-key="contact.billing_email" value="billing@digitalloka.dev" style="width:200px"/></div>
          <div class="setting-row"><div><div class="setting-key">Ops Alert Email</div><div class="setting-desc">Receives droplet and critical alerts</div></div><input class="setting-input" data-setting-group="contact" data-setting-key="contact.ops_alert_email" value="ops@digitalloka.dev" style="width:200px"/></div>
          <div class="setting-row"><div><div class="setting-key">Support Email</div><div class="setting-desc">User-facing support contact address</div></div><input class="setting-input" data-setting-group="contact" data-setting-key="contact.support_email" value="support@digitalloka.dev" style="width:200px"/></div>
          <div class="setting-row"><div><div class="setting-key">Audit Webhooks</div><div class="setting-desc">POST critical events to external endpoint</div></div><label class="toggle"><input type="checkbox" data-setting-group="contact" data-setting-key="contact.audit_webhooks"/><span class="toggle-slider"></span></label></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ==================== ACCOUNT ==================== -->
<div class="page" id="page-account">
  <div class="ph"><div><div class="ph-title">Admin Account</div><div class="ph-sub">Your admin profile and session settings</div></div></div>
  <div class="grid-2">
    <div class="panel">
      <div class="panel-hd"><div class="panel-title">Profile</div><button class="btn btn-sm">Edit</button></div>
      <div class="panel-body">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
          <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--secondary));border:2px solid var(--foreground);box-shadow:3px 3px 0 var(--shadow);display:flex;align-items:center;justify-content:center;font-family:var(--font-h);font-weight:900;font-size:1.2rem;color:#fff">AL</div>
          <div><div style="font-family:var(--font-h);font-size:1.05rem;font-weight:800">Aldo</div><div style="font-size:0.78rem;color:var(--muted-foreground)">devaldo@index-now.dev</div></div>
        </div>
        <div class="setting-row"><div class="setting-key">Role</div><span class="badge b-pink">Admin</span></div>
        <div class="setting-row"><div class="setting-key">Location</div><span style="font-weight:700;font-size:0.82rem">Jakarta, Indonesia</span></div>
        <div class="setting-row"><div class="setting-key">Two-Factor Auth</div><label class="toggle"><input type="checkbox" checked/><span class="toggle-slider"></span></label></div>
        <div class="setting-row"><div class="setting-key">Session Timeout</div><input class="setting-input" value="30 min" style="width:100px"/></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-hd"><div class="panel-title">Recent Admin Sessions</div></div>
      <div style="padding:0">
        <table class="tbl">
          <thead><tr><th>IP</th><th>Device</th><th>Started</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td class="mono">103.x.x.x</td><td>Chrome / macOS</td><td style="font-size:0.72rem;color:var(--muted-foreground)">Now</td><td><span class="badge b-green"><span class="dot"></span>Active</span></td></tr>
            <tr><td class="mono">103.x.x.x</td><td>Chrome / macOS</td><td style="font-size:0.72rem;color:var(--muted-foreground)">Yesterday</td><td><span class="badge b-muted">Expired</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- ==================== SUPPORT ==================== -->
<div class="page" id="page-support">
  <div class="ph"><div><div class="ph-title">Support</div><div class="ph-sub">Internal support tools and documentation</div></div><div class="ph-actions"><button class="btn btn-accent" onclick="openSupportTicket()">+ New Ticket</button></div></div>
  <div class="grid-3">
    <div class="panel" style="cursor:pointer" onclick="openSupportDocs()">
      <div class="panel-body" style="text-align:center;padding:28px 16px"><div style="font-size:2rem;margin-bottom:8px">📚</div><div style="font-family:var(--font-h);font-weight:800;margin-bottom:4px">Documentation</div><div style="font-size:0.75rem;color:var(--muted-foreground)">Admin guides and API reference</div></div>
    </div>
    <div class="panel" style="cursor:pointer" onclick="openSystemStatus()">
      <div class="panel-body" style="text-align:center;padding:28px 16px"><div style="font-size:2rem;margin-bottom:8px">🔧</div><div style="font-family:var(--font-h);font-weight:800;margin-bottom:4px">System Status</div><div style="font-size:0.75rem;color:var(--muted-foreground)">Infra and provider health</div></div>
    </div>
    <div class="panel" style="cursor:pointer" onclick="contactSupport()">
      <div class="panel-body" style="text-align:center;padding:28px 16px"><div style="font-size:2rem;margin-bottom:8px">📧</div><div style="font-family:var(--font-h);font-weight:800;margin-bottom:4px">Contact Support</div><div style="font-size:0.75rem;color:var(--muted-foreground)">Escalation and billing disputes</div></div>
    </div>
  </div>
  <div class="panel"><div class="panel-hd"><div class="panel-title">Open Tickets</div></div><div class="empty"><div class="empty-ico">🎉</div><div class="empty-ttl">No open tickets</div><div class="empty-txt">All clear. Open a ticket if you need escalation support.</div></div></div>
</div>

</main>
</div><!-- /.app -->

<!-- MODAL -->
<x-ui.modal id="modal" title="Event Payload" body-id="modal-body" backdrop-click="closeModal(event)" />

<!-- TOAST -->
<x-ui.toast id="toast" variant="admin" />

<script>
/* ============================================================ DATA */
let DATA = {
  products:[],
  orders:[],
  users:[],
  entitlements:[],
  droplets:[],
  audit:[],
  productTypes:[],
  productStocks:[]
};

let selectedProductTypeKey = null;
let productTypeDraftFields = [];
let productTypeEditorMode = 'create';
let hasLoadedHeavyData = false;
let isLoadingHeavyData = false;
let selectedStockProductId = null;

const API = {
  bootstrap: '/api/admin/bootstrap?per_page=100',
  products: '/api/admin/products?per_page=100',
  orders: '/api/admin/orders?per_page=100',
  users: '/api/admin/users?per_page=100',
  entitlements: '/api/admin/entitlements?per_page=100',
  droplets: '/api/admin/droplets',
  audit: '/api/admin/audit-logs?per_page=100',
  settings: '/api/admin/settings',
  productTypes: '/api/admin/product-types',
  productStocks: '/api/admin/product-stocks',
  productStocksImport: '/api/admin/product-stocks/import',
  productStocksExport: '/api/admin/product-stocks/export',
};

function fmtDate(value){
  if(!value) return '—';
  const d = new Date(value);
  if(Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

function money(amount, currency='USD'){
  const n = Number(amount || 0);
  if(Number.isNaN(n)) return '$0';
  try {
    return new Intl.NumberFormat('en-US', { style:'currency', currency }).format(n);
  } catch {
    return `$${n}`;
  }
}

async function fetchJson(url){
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if(!response.ok){
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function mapProducts(payload){
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows.map(p => ({
    rawId: p.id,
    id: `PRD-${String(p.id).padStart(3, '0')}`,
    name: p.name,
    slug: p.slug,
    type: p.product_type || 'digital',
    status: p.status || 'available',
    shortDescription: p.short_description || '',
    cat: p.category?.name || 'General',
    visible: Boolean(p.is_visible),
    price: p.prices_count ? `${p.prices_count} prices` : '—',
    updated: fmtDate(p.updated_at || p.created_at),
  }));
}

function mapOrders(payload){
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows.map(o => ({
    rawId: o.id,
    id: o.order_number || `ORD-${String(o.id).padStart(4, '0')}`,
    user: o.user?.email || o.user_id,
    items: Array.isArray(o.items) ? o.items.length : 0,
    totalRaw: Number(o.total_amount || 0),
    total: money(o.total_amount, o.currency || 'USD'),
    pay: (o.payment_status || 'pending').toLowerCase(),
    fulfill: (o.status || 'pending').toLowerCase(),
    created: fmtDate(o.created_at),
  }));
}

function mapUsers(payload){
  const rows = Array.isArray(payload?.data) ? payload.data : [];

  const productCountByUser = DATA.entitlements.reduce((acc, entitlement) => {
    const key = String(entitlement.user || '');
    if(!key){
      return acc;
    }
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return rows.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role || 'user',
    status: u.is_active ? 'active' : 'blocked',
    prods: productCountByUser[String(u.email || '')] || 0,
    last: fmtDate(u.created_at),
  }));
}

function mapEntitlements(payload){
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows.map(e => ({
    rawId: e.id,
    id: `ENT-${String(e.id).padStart(3, '0')}`,
    user: e.user?.email || e.user_id,
    prod: e.product?.name || `Product #${e.product_id}`,
    order: e.order_item_id ? `ITEM-${e.order_item_id}` : '—',
    status: (e.status || 'pending').toLowerCase(),
    starts: fmtDate(e.starts_at),
    expires: fmtDate(e.expires_at),
  }));
}

function mapDroplets(payload){
  const rows = Array.isArray(payload?.droplets) ? payload.droplets : [];
  return rows.map(d => ({
    id: String(d.id),
    user: d.owner_email || d.owner_user_id || '—',
    ent: d.entitlement_id ? `ENT-${String(d.entitlement_id).padStart(3,'0')}` : '—',
    region: d.region || '—',
    plan: d.size || '—',
    status: (d.status || 'stopped').toLowerCase(),
    ip: d.ip_address || '—',
    last: fmtDate(d.updated_at),
  }));
}

function mapAudit(payload){
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows.map(e => ({
    id: `EVT-${String(e.id).padStart(4,'0')}`,
    actor: e.actor || 'system',
    action: e.action,
    ttype: e.target_type,
    tid: e.target_id || '—',
    result: (e.result || 'ok').toLowerCase(),
    ts: fmtDate(e.created_at),
    payload: e.changes || {},
  }));
}

function applyProductTypesPayload(payload){
  DATA.productTypes = Array.isArray(payload?.data) ? payload.data : [];
  renderProductTypesPage();
  syncCreateProductTypeOptions();
}

async function prefetchProductTypesFast(){
  try {
    const payload = await fetchJson(API.productTypes);
    applyProductTypesPayload(payload);
  } catch {
    // Keep UI responsive; bootstrap/fallback flow will still populate product types later.
  }
}

function pageNeedsHeavyData(page){
  return !['product-types', 'product-type-editor', 'product-create'].includes(page);
}

async function loadHeavyDataOnce(){
  if(hasLoadedHeavyData || isLoadingHeavyData){
    return;
  }

  isLoadingHeavyData = true;

  try {
    const payload = await fetchJson(API.bootstrap);
    DATA.products = mapProducts(payload?.products || {});
    DATA.orders = mapOrders(payload?.orders || {});
    DATA.entitlements = mapEntitlements(payload?.entitlements || {});
    DATA.users = mapUsers(payload?.users || {});
    DATA.droplets = mapDroplets(payload?.droplets || {});
    DATA.audit = mapAudit(payload?.audit || {});
    applySettings(payload?.settings?.settings || {});
    applyProductTypesPayload(payload?.product_types || {});
  } catch (error) {
    const results = await Promise.allSettled([
      fetchJson(API.products),
      fetchJson(API.orders),
      fetchJson(API.users),
      fetchJson(API.entitlements),
      fetchJson(API.droplets),
      fetchJson(API.audit),
      fetchJson(API.settings),
      fetchJson(API.productTypes),
    ]);

    if(results[0].status === 'fulfilled'){ DATA.products = mapProducts(results[0].value); }
    if(results[1].status === 'fulfilled'){ DATA.orders = mapOrders(results[1].value); }
    if(results[3].status === 'fulfilled'){ DATA.entitlements = mapEntitlements(results[3].value); }
    if(results[2].status === 'fulfilled'){ DATA.users = mapUsers(results[2].value); }
    if(results[4].status === 'fulfilled'){ DATA.droplets = mapDroplets(results[4].value); }
    if(results[5].status === 'fulfilled'){ DATA.audit = mapAudit(results[5].value); }
    if(results[6].status === 'fulfilled'){ applySettings(results[6].value?.settings || {}); }
    if(results[7].status === 'fulfilled'){ applyProductTypesPayload(results[7].value || {}); }
  }

  hasLoadedHeavyData = true;
  isLoadingHeavyData = false;

  renderProducts();
  renderOrders();
  renderUsers();
  renderEntitlements();
  renderDroplets();
  renderAudit();
  renderOverview();
  renderSidebarSignals();
  renderProductTypesPage();
  syncCreateProductTypeOptions();
  renderProductStockProducts();
  updateProductStockManagementPanel();

  if(initialPage === 'product-stocks-manage' || initialPage === 'product-stocks'){
    loadProductStocks();
  }
}

async function loadBackendData(){
  // Product Types is lightweight and should render quickly without waiting for heavy bootstrap data.
  const fastProductTypesPromise = prefetchProductTypesFast();

  if(pageNeedsHeavyData(initialPage)){
    await Promise.all([fastProductTypesPromise, loadHeavyDataOnce()]);
    return;
  }

  await fastProductTypesPromise;
}

function getProductTypeConfig(typeKey){
  return DATA.productTypes.find((item) => item.type === typeKey) || null;
}

function syncCreateProductTypeOptions(){
  const select = document.getElementById('cp-type');
  if(!select){
    return;
  }

  const fallbackTypes = ['digital', 'template', 'course', 'vps_droplet'];
  const sourceTypes = DATA.productTypes.length > 0
    ? DATA.productTypes.filter((item) => item.is_active !== false).map((item) => item.type)
    : fallbackTypes;

  const selectedValue = select.value;
  select.innerHTML = sourceTypes.map((type) => `<option value="${type}">${type}</option>`).join('');
  if(sourceTypes.includes(selectedValue)){
    select.value = selectedValue;
  }

  renderCreateProductTypeFields(select.value);
}

function renderCreateProductTypeFields(typeKey){
  const container = document.getElementById('cp-type-fields');
  if(!container){
    return;
  }

  const config = getProductTypeConfig(typeKey);
  const fields = Array.isArray(config?.schema?.fields) ? config.schema.fields : [];

  if(fields.length === 0){
    container.innerHTML = '<div style="grid-column:1 / span 2;color:var(--muted-foreground);font-size:0.78rem">No additional fields for this type.</div>';
    return;
  }

  container.innerHTML = fields.map((field) => {
    const key = String(field.key || '');
    const label = String(field.label || key || 'Field');
    const required = Boolean(field.required);
    const help = field.help ? `<div style="font-size:0.68rem;color:var(--muted-foreground)">${field.help}</div>` : '';
    const requiredAttr = required ? 'required' : '';

    if(field.type === 'select'){
      const options = Array.isArray(field.options) ? field.options : [];
      const optionsHtml = options.map((opt) => `<option value="${String(opt)}">${String(opt)}</option>`).join('');
      return `<label style="display:flex;flex-direction:column;gap:6px">
        <span style="font-weight:700;font-size:0.75rem">${label}${required ? ' *' : ''}</span>
        <select class="setting-select" data-meta-key="${key}" data-meta-type="select" ${requiredAttr}>${optionsHtml}</select>
        ${help}
      </label>`;
    }

    if(field.type === 'boolean'){
      return `<label style="display:flex;align-items:center;gap:8px;font-size:0.78rem;font-weight:700">
        <input type="checkbox" data-meta-key="${key}" data-meta-type="boolean" /> ${label}
      </label>`;
    }

    if(field.type === 'textarea'){
      return `<label style="display:flex;flex-direction:column;gap:6px;grid-column:1 / span 2">
        <span style="font-weight:700;font-size:0.75rem">${label}${required ? ' *' : ''}</span>
        <textarea class="setting-input" rows="3" data-meta-key="${key}" data-meta-type="textarea" ${requiredAttr}></textarea>
        ${help}
      </label>`;
    }

    const inputType = field.type === 'number' ? 'number' : 'text';
    return `<label style="display:flex;flex-direction:column;gap:6px">
      <span style="font-weight:700;font-size:0.75rem">${label}${required ? ' *' : ''}</span>
      <input class="setting-input" type="${inputType}" data-meta-key="${key}" data-meta-type="${field.type}" ${requiredAttr} />
      ${help}
    </label>`;
  }).join('');
}

function collectTypeMetaFields(){
  const fields = Array.from(document.querySelectorAll('#cp-type-fields [data-meta-key]'));
  const meta = {};

  fields.forEach((field) => {
    const key = field.dataset.metaKey;
    const type = field.dataset.metaType;
    if(!key){
      return;
    }

    if(type === 'boolean'){
      meta[key] = Boolean(field.checked);
      return;
    }

    if(type === 'number'){
      const n = Number(field.value || 0);
      meta[key] = Number.isFinite(n) ? n : 0;
      return;
    }

    meta[key] = String(field.value || '').trim();
  });

  return meta;
}

function renderProductTypesPage(){
  const list = document.getElementById('product-type-list');
  if(!list){
    return;
  }

  const rows = getFilteredProductTypes();
  if(rows.length === 0){
    list.innerHTML = '<tr><td colspan="6" style="color:var(--muted-foreground);font-size:0.78rem">No product type schema found.</td></tr>';
    return;
  }

  list.innerHTML = rows.map((item) => {
    const fieldCount = Array.isArray(item?.schema?.fields) ? item.schema.fields.length : 0;
    const description = String(item.description || '—');
    const isActive = item.is_active !== false;
    const statusBadge = isActive
      ? '<span class="badge b-green"><span class="dot"></span>active</span>'
      : '<span class="badge b-muted"><span class="dot"></span>inactive</span>';
    return `<tr>
      <td class="mono">${escapeHtmlAttr(item.type)}</td>
      <td style="font-weight:800">${escapeHtmlAttr(item.label || item.type)}</td>
      <td>${statusBadge}</td>
      <td style="color:var(--muted-foreground);font-size:0.74rem">${escapeHtmlAttr(description)}</td>
      <td><span class="tag">${fieldCount} fields</span></td>
      <td><div class="act-group"><button class="btn btn-sm" onclick='openProductTypeEditor(${JSON.stringify(String(item.type || ""))})'>Edit</button><button class="btn btn-sm btn-danger" onclick='deleteProductType(${JSON.stringify(String(item.type || ""))})'>Delete</button></div></td>
    </tr>`;
  }).join('');
}

function getFilteredProductTypes(){
  const mode = (document.getElementById('pt-filter-type')?.value || 'all').trim();
  const search = (document.getElementById('pt-filter-search')?.value || '').trim().toLowerCase();

  return DATA.productTypes.filter((item) => {
    const type = String(item.type || '');
    const label = String(item.label || '');

    if(mode === 'vps_only' && type !== 'vps_droplet'){
      return false;
    }

    if(mode === 'custom_only' && ['digital', 'template', 'course', 'vps_droplet'].includes(type)){
      return false;
    }

    if(search !== '' && !`${type} ${label}`.toLowerCase().includes(search)){
      return false;
    }

    return true;
  });
}

function normalizeProductTypeFields(fields){
  const source = Array.isArray(fields) ? fields : [];
  return source.map((field, index) => {
    const type = ['text', 'number', 'select', 'boolean', 'textarea'].includes(field?.type) ? field.type : 'text';
    const key = String(field?.key || `field_${index + 1}`).trim();
    const label = String(field?.label || key || `Field ${index + 1}`).trim();
    const required = Boolean(field?.required);
    const help = String(field?.help || '').trim();
    const options = Array.isArray(field?.options) ? field.options.map((opt) => String(opt).trim()).filter(Boolean) : [];

    return { key, label, type, required, help, options };
  });
}

function renderProductTypeFieldsEditor(){
  const container = document.getElementById('pt-fields-editor');
  if(!container){
    return;
  }

  if(productTypeDraftFields.length === 0){
    container.innerHTML = '<div style="color:var(--muted-foreground);font-size:0.78rem">No fields yet. Click Add Field.</div>';
    return;
  }

  container.innerHTML = productTypeDraftFields.map((field, index) => `
    <div style="border:1px solid var(--border);border-radius:10px;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;background:var(--card)">
      <label style="display:flex;flex-direction:column;gap:6px">
        <span style="font-size:0.72rem;font-weight:700">Key</span>
        <input class="setting-input" value="${escapeHtmlAttr(field.key)}" oninput="setProductTypeFieldValue(${index}, 'key', this.value)" placeholder="operating_system" />
      </label>
      <label style="display:flex;flex-direction:column;gap:6px">
        <span style="font-size:0.72rem;font-weight:700">Label</span>
        <input class="setting-input" value="${escapeHtmlAttr(field.label)}" oninput="setProductTypeFieldValue(${index}, 'label', this.value)" placeholder="Operating System" />
      </label>
      <label style="display:flex;flex-direction:column;gap:6px">
        <span style="font-size:0.72rem;font-weight:700">Type</span>
        <select class="setting-select" onchange="setProductTypeFieldValue(${index}, 'type', this.value)">
          <option value="text" ${field.type === 'text' ? 'selected' : ''}>text</option>
          <option value="number" ${field.type === 'number' ? 'selected' : ''}>number</option>
          <option value="select" ${field.type === 'select' ? 'selected' : ''}>select</option>
          <option value="boolean" ${field.type === 'boolean' ? 'selected' : ''}>boolean</option>
          <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>textarea</option>
        </select>
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:0.78rem;font-weight:700;padding-top:18px">
        <input type="checkbox" ${field.required ? 'checked' : ''} onchange="setProductTypeFieldValue(${index}, 'required', this.checked)" /> Required
      </label>
      <label style="display:flex;flex-direction:column;gap:6px;grid-column:1 / span 2">
        <span style="font-size:0.72rem;font-weight:700">Help Text</span>
        <input class="setting-input" value="${escapeHtmlAttr(field.help || '')}" oninput="setProductTypeFieldValue(${index}, 'help', this.value)" placeholder="Optional helper text" />
      </label>
      ${field.type === 'select' ? `
      <label style="display:flex;flex-direction:column;gap:6px;grid-column:1 / span 2">
        <span style="font-size:0.72rem;font-weight:700">Options</span>
        <input class="setting-input" value="${escapeHtmlAttr((field.options || []).join(', '))}" oninput="setProductTypeFieldValue(${index}, 'optionsCsv', this.value)" placeholder="Ubuntu 22 LTS, Ubuntu 24 LTS" />
      </label>
      ` : ''}
      <div style="grid-column:1 / span 2;display:flex;justify-content:flex-end">
        <button type="button" class="btn btn-sm btn-danger" onclick="removeProductTypeField(${index})">Remove Field</button>
      </div>
    </div>
  `).join('');
}

function setProductTypeFieldValue(index, prop, value){
  const field = productTypeDraftFields[index];
  if(!field){
    return;
  }

  if(prop === 'required'){
    field.required = Boolean(value);
    return;
  }

  if(prop === 'type'){
    field.type = String(value || 'text');
    if(field.type !== 'select'){
      field.options = [];
    }
    renderProductTypeFieldsEditor();
    return;
  }

  if(prop === 'optionsCsv'){
    field.options = String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return;
  }

  field[prop] = String(value || '').trim();
}

function addProductTypeField(){
  productTypeDraftFields.push({
    key: `field_${productTypeDraftFields.length + 1}`,
    label: `Field ${productTypeDraftFields.length + 1}`,
    type: 'text',
    required: false,
    help: '',
    options: [],
  });

  renderProductTypeFieldsEditor();
}

function removeProductTypeField(index){
  productTypeDraftFields.splice(index, 1);
  renderProductTypeFieldsEditor();
}

function buildProductTypeSchemaFromDraft(){
  const fields = productTypeDraftFields.map((field) => {
    const normalized = {
      key: String(field.key || '').trim(),
      label: String(field.label || '').trim(),
      type: String(field.type || 'text').trim(),
      required: Boolean(field.required),
    };

    const help = String(field.help || '').trim();
    if(help !== ''){
      normalized.help = help;
    }

    if(normalized.type === 'select'){
      normalized.options = (Array.isArray(field.options) ? field.options : [])
        .map((opt) => String(opt || '').trim())
        .filter(Boolean);
    }

    return normalized;
  }).filter((field) => field.key !== '' && field.label !== '');

  return { fields };
}

function escapeHtmlAttr(value){
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function openProductTypeEditor(typeKey = null){
  const typeInput = document.getElementById('pt-type-key');
  const labelInput = document.getElementById('pt-label');
  const descInput = document.getElementById('pt-description');
  const activeInput = document.getElementById('pt-is-active');

  if(!typeInput || !labelInput || !descInput || !activeInput){
    return;
  }

  if(typeKey){
    const selected = DATA.productTypes.find((item) => item.type === typeKey);
    if(!selected){
      showToast('⚠️ Product type not found.','fail');
      return;
    }

    productTypeEditorMode = 'edit';
    selectedProductTypeKey = typeKey;
    typeInput.value = selected.type || '';
    typeInput.disabled = true;
    labelInput.value = selected.label || '';
    descInput.value = selected.description || '';
    activeInput.value = selected.is_active === false ? 'inactive' : 'active';
    productTypeDraftFields = normalizeProductTypeFields(selected?.schema?.fields || []);

    nav('product-type-editor', null);
    window.history.replaceState({ page: 'product-type-editor' }, '', `/admin/product-types/${encodeURIComponent(typeKey)}/edit`);
    renderProductTypeFieldsEditor();
    return;
  }

  productTypeEditorMode = 'create';
  selectedProductTypeKey = null;
  typeInput.value = '';
  typeInput.disabled = false;
  labelInput.value = '';
  descInput.value = '';
  activeInput.value = 'active';
  productTypeDraftFields = [{ key: 'field_1', label: 'Field 1', type: 'text', required: false, help: '', options: [] }];

  nav('product-type-editor', null);
  window.history.replaceState({ page: 'product-type-editor' }, '', '/admin/product-types/create');
  renderProductTypeFieldsEditor();
}

async function saveCurrentProductType(){
  const type = (document.getElementById('pt-type-key')?.value || '').trim();
  const label = (document.getElementById('pt-label')?.value || '').trim();
  const description = (document.getElementById('pt-description')?.value || '').trim();
  const isActive = (document.getElementById('pt-is-active')?.value || 'active') === 'active';

  if(!type || !label){
    showToast('⚠️ Type and label are required.','fail');
    return;
  }

  const schema = buildProductTypeSchemaFromDraft();
  if(!Array.isArray(schema.fields) || schema.fields.length === 0){
    showToast('⚠️ Add at least one valid field before saving.','fail');
    return;
  }

  const invalidSelect = schema.fields.find((field) => field.type === 'select' && (!Array.isArray(field.options) || field.options.length === 0));
  if(invalidSelect){
    showToast(`⚠️ Select field "${invalidSelect.label}" must have options.`,'fail');
    return;
  }

  try {
    await requestJson(`/api/admin/product-types/${type}`, {
      method: 'PUT',
      body: JSON.stringify({ label, description: description || null, is_active: isActive, schema }),
    });
    showToast('✅ Product type saved.','ok');
    await loadBackendData();
    nav('product-types', null);
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function deleteProductType(type){
  const safeType = String(type || '').trim();
  if(!safeType){
    showToast('⚠️ Invalid product type.','fail');
    return;
  }

  const confirmed = window.confirm(`Delete product type "${safeType}"?`);
  if(!confirmed){
    return;
  }

  try {
    await requestJson(`/api/admin/product-types/${encodeURIComponent(safeType)}`, {
      method: 'DELETE',
    });
    showToast('✅ Product type deleted.','ok');
    await loadBackendData();
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function refreshProductTypes(){
  try {
    const payload = await requestJson(API.productTypes);
    DATA.productTypes = Array.isArray(payload?.data) ? payload.data : [];
    renderProductTypesPage();
    syncCreateProductTypeOptions();
    showToast('✅ Product types refreshed.','ok');
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

let productStocksSearchTimer = null;

function getActiveProductsForStock(){
  return DATA.products.filter((product) => {
    const status = String(product.status || '').toLowerCase();
    return product.visible === true && (status === 'available' || status === 'active');
  });
}

function refreshProductStockProducts(){
  renderProductStockProducts();
}

function refreshSelectedProductStocks(){
  if(String(selectedStockProductId || '').trim() === ''){
    showToast('⚠️ Select a product from Product Stocks first.','fail');
    return;
  }

  loadProductStocks();
}

function renderProductStockProducts(){
  const body = document.getElementById('product-stock-products-body');
  if(!body){
    return;
  }

  const search = String(document.getElementById('ps-product-search')?.value || '').trim().toLowerCase();
  const activeProducts = getActiveProductsForStock().filter((product) => {
    if(search === ''){
      return true;
    }

    return `${product.name} ${product.slug} ${product.type} ${product.cat}`.toLowerCase().includes(search);
  });

  if(activeProducts.length === 0){
    body.innerHTML = '<tr><td colspan="6" style="color:var(--muted-foreground);font-size:0.78rem">No active products available for stock management.</td></tr>';
    return;
  }

  body.innerHTML = activeProducts.map((product) => {
    const isSelected = String(selectedStockProductId || '') === String(product.rawId);
    return `<tr ${isSelected ? 'style="background:rgba(139,92,246,0.08)"' : ''}>
      <td class="mono">${product.id}</td>
      <td><div class="fw">${escapeHtmlAttr(product.name)}</div><div style="font-size:0.68rem;color:var(--muted-foreground)">${escapeHtmlAttr(product.slug)}</div></td>
      <td><span class="tag">${escapeHtmlAttr(product.type)}</span></td>
      <td style="color:var(--muted-foreground)">${escapeHtmlAttr(product.cat || '-')}</td>
      <td>${badge(product.status || 'available')}</td>
      <td><button class="btn btn-sm" onclick="openProductStocks('${product.rawId}')">Manage Stocks</button></td>
    </tr>`;
  }).join('');
}

function updateProductStockManagementPanel(){
  const panel = document.getElementById('ps-stock-management-panel');
  const label = document.getElementById('ps-selected-product-label');
  if(!panel || !label){
    return;
  }

  const selectedProductId = String(selectedStockProductId || '').trim();
  if(selectedProductId === ''){
    panel.style.display = 'none';
    label.textContent = '-';
    return;
  }

  const selectedProduct = DATA.products.find((product) => String(product.rawId) === selectedProductId);
  panel.style.display = 'block';
  label.textContent = selectedProduct ? selectedProduct.name : `Product #${selectedProductId}`;
}

function debouncedLoadProductStocks(){
  if(productStocksSearchTimer !== null){
    clearTimeout(productStocksSearchTimer);
  }

  productStocksSearchTimer = window.setTimeout(() => {
    loadProductStocks();
  }, 250);
}

async function loadProductStocks(){
  const productId = String(selectedStockProductId || '').trim();
  const status = String(document.getElementById('ps-status-filter')?.value || '').trim();
  const q = String(document.getElementById('ps-search')?.value || '').trim();
  updateProductStockManagementPanel();

  if(productId === ''){
    DATA.productStocks = [];
    renderProductStocks();
    return;
  }

  const params = new URLSearchParams();
  if(productId !== ''){
    params.set('product_id', productId);
  }
  if(status !== ''){
    params.set('status', status);
  }
  if(q !== ''){
    params.set('q', q);
  }

  try {
    const payload = await requestJson(`${API.productStocks}?${params.toString()}`);
    DATA.productStocks = Array.isArray(payload?.data) ? payload.data : [];
    renderProductStocks();
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

function renderProductStocks(){
  const body = document.getElementById('product-stocks-body');
  if(!body){
    return;
  }

  const selectedProduct = String(selectedStockProductId || '').trim();
  if(selectedProduct === ''){
    body.innerHTML = '<tr><td colspan="6" style="color:var(--muted-foreground);font-size:0.78rem">Select an active product above to manage stocks.</td></tr>';
    return;
  }

  if(!Array.isArray(DATA.productStocks) || DATA.productStocks.length === 0){
    body.innerHTML = '<tr><td colspan="6" style="color:var(--muted-foreground);font-size:0.78rem">No stock items found for this product.</td></tr>';
    return;
  }

  body.innerHTML = DATA.productStocks.map((item) => {
    const data = item.credential_data && typeof item.credential_data === 'object' ? item.credential_data : {};
    const credentialSummary = Object.entries(data)
      .slice(0, 4)
      .map(([key, value]) => `<span class="tag">${escapeHtmlAttr(key)}: ${escapeHtmlAttr(String(value || ''))}</span>`)
      .join(' ');

    return `<tr>
      <td class="mono">${item.id}</td>
      <td>${badge(item.status || 'unsold')}</td>
      <td><div style="display:flex;flex-wrap:wrap;gap:6px">${credentialSummary || '<span style="color:var(--muted-foreground)">-</span>'}</div></td>
      <td style="color:var(--muted-foreground);font-size:0.72rem">${fmtDate(item.created_at)}</td>
      <td style="color:var(--muted-foreground);font-size:0.72rem">${item.sold_at ? fmtDate(item.sold_at) : '-'}</td>
      <td><div class="act-group"><button class="btn btn-sm" onclick='editProductStockItem(${JSON.stringify(item.id)}, ${JSON.stringify(item.credential_data || {})}, ${JSON.stringify(item.status || 'unsold')})'>Edit</button><button class="btn btn-sm btn-danger" onclick='deleteProductStockItem(${JSON.stringify(item.id)})'>Delete</button></div></td>
    </tr>`;
  }).join('');
}

function clearProductStocksInput(){
  const rowsInput = document.getElementById('ps-input-rows');
  if(rowsInput){
    rowsInput.value = '';
  }
}

function setProductStocksImportFormVisible(isVisible){
  const formWrap = document.getElementById('psm-import-wrap');
  if(!formWrap){
    return;
  }

  formWrap.style.display = isVisible ? 'block' : 'none';
}

function openProductStocksImportForm(){
  setProductStocksImportFormVisible(true);
}

function closeProductStocksImportForm(){
  setProductStocksImportFormVisible(false);
}

async function submitProductStocksBatch(){
  const selectedProduct = String(selectedStockProductId || '').trim();
  if(selectedProduct === ''){
    showToast('⚠️ Select an active product first.','fail');
    return;
  }

  const headersLine = String(document.getElementById('ps-input-headers')?.value || '').trim();
  if(headersLine === ''){
    showToast('⚠️ Headers are required.','fail');
    return;
  }

  const rows = String(document.getElementById('ps-input-rows')?.value || '').trim();
  if(rows === ''){
    showToast('⚠️ Paste at least one stock row.','fail');
    return;
  }

  const headers = headersLine.split('|').map((item) => item.trim()).filter(Boolean);
  if(headers.length === 0){
    showToast('⚠️ Invalid headers.','fail');
    return;
  }

  try {
    const result = await requestJson(API.productStocksImport, {
      method: 'POST',
      body: JSON.stringify({
        product_id: Number(selectedProduct),
        headers,
        rows,
        set_as_default_headers: true,
      }),
    });

    showToast(`✅ Imported ${result.inserted} rows. Skipped duplicates: ${result.skipped_duplicates}.`,'ok');
    clearProductStocksInput();
    await loadProductStocks();
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function editProductStockItem(stockId, credentialData, currentStatus){
  const sourceData = credentialData && typeof credentialData === 'object' ? credentialData : {};
  const headers = Object.keys(sourceData);
  if(headers.length === 0){
    showToast('⚠️ This stock item has empty data.','fail');
    return;
  }

  const currentValues = headers.map((header) => String(sourceData[header] || '')).join('|');
  const editedValues = (window.prompt(`Edit values for headers: ${headers.join('|')}`, currentValues) || '').trim();
  if(!editedValues){
    return;
  }

  const status = (window.prompt('Status (unsold/sold):', currentStatus || 'unsold') || '').trim().toLowerCase();
  if(!['unsold', 'sold'].includes(status)){
    showToast('⚠️ Invalid status.','fail');
    return;
  }

  const values = editedValues.split('|').map((item) => item.trim());
  if(values.length !== headers.length){
    showToast('⚠️ Value count must match existing header count.','fail');
    return;
  }

  const nextCredentialData = {};
  headers.forEach((header, index) => {
    nextCredentialData[header] = values[index] || '';
  });

  try {
    await requestJson(`/api/admin/product-stocks/${stockId}`, {
      method: 'PUT',
      body: JSON.stringify({
        credential_data: nextCredentialData,
        status,
      }),
    });
    showToast('✅ Stock item updated.','ok');
    await loadProductStocks();
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function deleteProductStockItem(stockId){
  const confirmed = window.confirm('Delete this stock item?');
  if(!confirmed){
    return;
  }

  try {
    await requestJson(`/api/admin/product-stocks/${stockId}`, {
      method: 'DELETE',
    });
    showToast('✅ Stock item deleted.','ok');
    await loadProductStocks();
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function exportProductStocks(){
  const selectedProduct = String(selectedStockProductId || '').trim();
  if(selectedProduct === ''){
    showToast('⚠️ Select an active product first.','fail');
    return;
  }

  try {
    const result = await requestJson(`${API.productStocksExport}?product_id=${encodeURIComponent(selectedProduct)}`);
    openPayload(JSON.stringify({
      product_id: result.product_id,
      product_name: result.product_name,
      header: result.header_line,
      rows_text: result.rows_text,
      rows_count: Array.isArray(result.rows) ? result.rows.length : 0,
    }));
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

function countExpiringEntitlements(days = 7){
  const now = new Date();
  const upper = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

  return DATA.entitlements.filter((entitlement) => {
    if(entitlement.status === 'expiring'){
      return true;
    }
    const expiryDate = entitlement.expires ? new Date(entitlement.expires) : null;
    if(!expiryDate || Number.isNaN(expiryDate.getTime())){
      return false;
    }
    return expiryDate >= now && expiryDate <= upper;
  }).length;
}

function renderOverview(){
  const activeProducts = DATA.products.filter((product) => product.visible).length;
  const activeEntitlements = DATA.entitlements.filter((entitlement) => entitlement.status === 'active').length;
  const expiringEntitlements = countExpiringEntitlements(7);
  const blockedUsers = DATA.users.filter((user) => user.status === 'blocked').length;
  const pendingOrders = DATA.orders.filter((order) => order.fulfill === 'pending').length;
  const dropletsInAction = DATA.droplets.filter((droplet) => !['running', 'stopped'].includes(droplet.status)).length;
  const revenueMtd = DATA.orders
    .filter((order) => order.pay === 'paid')
    .reduce((total, order) => total + (Number(order.totalRaw || 0)), 0);
  const auditFailures = DATA.audit.filter((entry) => ['fail', 'failed'].includes(entry.result)).length;
  const actionUserCount = new Set(
    DATA.droplets
      .filter((droplet) => !['running', 'stopped'].includes(droplet.status))
      .map((droplet) => droplet.user)
      .filter(Boolean)
  ).size;

  const setText = (id, value) => {
    const node = document.getElementById(id);
    if(node){
      node.textContent = value;
    }
  };

  setText('stat-products-total', String(DATA.products.length));
  setText('stat-products-sub', `${activeProducts} active`);
  setText('stat-entitlements-active', String(activeEntitlements));
  setText('stat-entitlements-sub', `${expiringEntitlements} expiring soon`);
  setText('stat-users-total', String(DATA.users.length));
  setText('stat-users-sub', `${blockedUsers} blocked`);
  setText('stat-orders-total', String(DATA.orders.length));
  setText('stat-orders-sub', `${pendingOrders} pending`);
  setText('stat-droplets-total', String(DATA.droplets.length));
  setText('stat-droplets-sub', `${dropletsInAction} in action`);
  setText('stat-actions-progress', String(dropletsInAction));
  setText('stat-actions-sub', `${actionUserCount} users affected`);
  setText('stat-revenue-mtd', money(revenueMtd, 'USD'));
  setText('stat-revenue-sub', 'From paid orders');
  setText('stat-audit-total', String(DATA.audit.length));
  setText('stat-audit-sub', `${auditFailures} failures`);

  setText('queue-pending-orders', String(pendingOrders));
  setText('queue-expiring-entitlements', String(expiringEntitlements));
  setText('queue-droplets-action', String(dropletsInAction));

  const overviewAuditBody = document.getElementById('overview-audit-body');
  if(overviewAuditBody){
    overviewAuditBody.innerHTML = DATA.audit.slice(0, 4).map((event) => `
      <tr class="audit-row ${event.result}">
        <td class="mono">${event.actor}</td>
        <td class="fw">${event.action}</td>
        <td>${badge(event.result)}</td>
        <td style="color:var(--muted-foreground);font-size:0.72rem">${event.ts}</td>
      </tr>
    `).join('');

    if(DATA.audit.length === 0){
      overviewAuditBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted-foreground);font-size:0.75rem">No audit data available.</td></tr>';
    }
  }
}

function renderSidebarSignals(){
  const pendingOrders = DATA.orders.filter((order) => order.fulfill === 'pending').length;
  const expiringEntitlements = countExpiringEntitlements(7);

  const ordersBadge = document.getElementById('nav-orders-badge');
  if(ordersBadge){
    if(pendingOrders > 0){
      ordersBadge.textContent = String(pendingOrders);
      ordersBadge.style.display = 'inline-flex';
    } else {
      ordersBadge.style.display = 'none';
    }
  }

  const entitlementsDot = document.getElementById('nav-entitlements-dot');
  if(entitlementsDot){
    entitlementsDot.style.display = expiringEntitlements > 0 ? 'inline-flex' : 'none';
  }
}

async function requestJson(url, options = {}){
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if(options.body && !headers['Content-Type']){
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if(!response.ok){
    const firstValidationError = payload?.errors ? Object.values(payload.errors)[0]?.[0] : null;
    throw new Error(firstValidationError || payload?.error || `Request failed (${response.status})`);
  }

  return payload;
}

function applySettings(settings){
  Object.entries(settings || {}).forEach(([group, items]) => {
    (Array.isArray(items) ? items : []).forEach((item) => {
      const selector = `[data-setting-group="${group}"][data-setting-key="${item.setting_key}"]`;
      const field = document.querySelector(selector);
      if(!field){
        return;
      }

      const value = item?.setting_value && typeof item.setting_value === 'object' && Object.prototype.hasOwnProperty.call(item.setting_value, 'value')
        ? item.setting_value.value
        : item.setting_value;

      if(field.type === 'checkbox'){
        field.checked = Boolean(value);
        return;
      }

      field.value = value ?? '';
    });
  });
}

/* ============================================================ BADGE HELPER */
function badge(status){
  const m={active:'b-green',running:'b-green',ok:'b-green',paid:'b-green',visible:'b-green',
    expiring:'b-amber',warn:'b-amber',pending:'b-amber',starting:'b-amber',
    stopped:'b-pink',blocked:'b-pink',fail:'b-pink',failed:'b-pink',revoked:'b-pink',suspended:'b-pink',hidden:'b-pink',
    draft:'b-muted',archived:'b-muted',expired:'b-muted',
    admin:'b-purple'};
  const cls=m[status]||'b-muted';
  return `<span class="badge ${cls}"><span class="dot"></span>${status}</span>`;
}

/* ============================================================ RENDER */
function renderProducts(){
  document.getElementById('products-body').innerHTML = DATA.products.map(p=>`<tr>
    <td class="mono">${p.id}</td>
    <td><div class="fw">${p.name}</div><div style="font-size:0.68rem;color:var(--muted-foreground);margin-top:1px">${p.slug}</div></td>
    <td><span class="tag">${p.type}</span></td>
    <td style="color:var(--muted-foreground)">${p.cat}</td>
    <td>${badge(p.visible?'visible':'hidden')}</td>
    <td style="font-family:var(--font-h);font-weight:800">${p.price}</td>
    <td style="color:var(--muted-foreground);font-size:0.72rem">${p.updated}</td>
    <td><div class="act-group">
      ${p.visible && String(p.status || '').toLowerCase() === 'available'
        ? `<button class="btn btn-sm" onclick="openProductStocks('${p.rawId}')">Stocks</button>`
        : `<button class="btn btn-sm btn-ghost" disabled title="Only active products can manage stocks">Stocks</button>`}
      <button class="btn btn-sm" onclick="editProduct('${p.rawId}')">Edit</button>
      <button class="btn btn-sm btn-ghost" onclick="toggleProductVisibility('${p.rawId}')">${p.visible?'Hide':'Show'}</button>
      <button class="btn btn-sm btn-ghost" onclick="viewProduct('${p.rawId}')">View</button>
    </div></td>
  </tr>`).join('');
}

function openProductStocks(productId){
  selectedStockProductId = String(productId || '').trim();
  nav('product-stocks-manage', null);
  setProductStocksImportFormVisible(false);

  if(selectedStockProductId !== ''){
    window.history.replaceState({ page: 'product-stocks-manage' }, '', `/admin/products/${encodeURIComponent(selectedStockProductId)}/stocks`);
  }

  updateProductStockManagementPanel();
  loadProductStocks();
}

function openProductStocksFromMenu(el){
  selectedStockProductId = null;
  setProductStocksImportFormVisible(false);
  nav('product-stocks', el || null);
  renderProductStockProducts();
}

function renderOrders(){
  document.getElementById('orders-body').innerHTML = DATA.orders.map(o=>`<tr>
    <td class="fw">${o.id}</td>
    <td class="mono">${o.user}</td>
    <td style="text-align:center;font-weight:700">${o.items}</td>
    <td style="font-family:var(--font-h);font-weight:800">${o.total}</td>
    <td>${badge(o.pay)}</td>
    <td>${badge(o.fulfill)}</td>
    <td style="color:var(--muted-foreground);font-size:0.72rem">${o.created}</td>
    <td><div class="act-group">
      <button class="btn btn-sm" onclick="viewOrder('${o.rawId}')">View</button>
      <button class="btn btn-sm btn-ghost" onclick="updateOrderStatus('${o.rawId}','${o.fulfill}')">Update</button>
    </div></td>
  </tr>`).join('');
}

function renderUsers(){
  document.getElementById('users-body').innerHTML = DATA.users.map(u=>`<tr>
    <td class="mono">${u.id}</td>
    <td class="fw">${u.email}</td>
    <td><span class="tag">${u.role}</span></td>
    <td>${badge(u.status)}</td>
    <td style="text-align:center;font-weight:700">${u.prods}</td>
    <td style="color:var(--muted-foreground);font-size:0.72rem">${u.last}</td>
    <td><div class="act-group">
      <button class="btn btn-sm" onclick="viewUser('${u.id}')">View</button>
      <button class="btn btn-sm ${u.status==='blocked'?'btn-success':'btn-danger'}" onclick="toggleUserAccess('${u.id}', ${u.status==='blocked'})">${u.status==='blocked'?'Unblock':'Block'}</button>
    </div></td>
  </tr>`).join('');
}

function renderEntitlements(){
  document.getElementById('ent-body').innerHTML = DATA.entitlements.map(e=>`<tr>
    <td class="mono">${e.id}</td>
    <td class="fw">${e.user}</td>
    <td>${e.prod}</td>
    <td class="mono">${e.order}</td>
    <td>${badge(e.status)}</td>
    <td style="color:var(--muted-foreground);font-size:0.72rem">${e.starts}</td>
    <td style="font-weight:700;font-size:0.8rem;color:${e.status==='expiring'?'var(--secondary)':'var(--foreground)'}">${e.expires}</td>
    <td><div class="act-group">
      <button class="btn btn-sm btn-success" onclick="updateEntitlementStatus('${e.rawId}','active')">Activate</button>
      <button class="btn btn-sm btn-warn" onclick="updateEntitlementStatus('${e.rawId}','pending')">Pending</button>
      <button class="btn btn-sm btn-danger" onclick="updateEntitlementStatus('${e.rawId}','revoked')">Revoke</button>
      <button class="btn btn-sm" onclick="extendEntitlement('${e.rawId}',30)">+30d</button>
    </div></td>
  </tr>`).join('');
}

function renderDroplets(){
  document.getElementById('droplets-body').innerHTML = DATA.droplets.map(d=>`<tr id="dr-${d.id.replace('-','_')}">
    <td class="mono">${d.id}</td>
    <td class="fw">${d.user}</td>
    <td class="mono">${d.ent}</td>
    <td><span class="tag">${d.region}</span></td>
    <td style="font-size:0.75rem;color:var(--muted-foreground)">${d.plan}</td>
    <td id="dst-${d.id.replace('-','_')}">${badge(d.status)}</td>
    <td id="dip-${d.id.replace('-','_')}" class="mono">${d.ip}</td>
    <td style="color:var(--muted-foreground);font-size:0.72rem">${d.last}</td>
    <td><div class="act-group">
      <button class="btn btn-sm btn-success" onclick="dropletOp('${d.id}','on')">On</button>
      <button class="btn btn-sm btn-danger" onclick="dropletOp('${d.id}','off')">Off</button>
      <button class="btn btn-sm btn-warn" onclick="dropletOp('${d.id}','reboot')">Reboot</button>
      <button class="btn btn-sm" onclick="dropletOp('${d.id}','refresh')">↺</button>
      <button class="btn btn-sm btn-ghost" onclick="viewDropletActions('${d.id}')">Log</button>
    </div></td>
  </tr>`).join('');
}

function getProductById(productId){
  return DATA.products.find((item) => String(item.rawId) === String(productId));
}

async function editProduct(productId){
  const product = getProductById(productId);
  if(!product){
    showToast('⚠️ Product not found in dashboard data.','fail');
    return;
  }

  const name = (window.prompt('Product name:', product.name) || '').trim();
  if(!name){
    showToast('⚠️ Product name is required.','fail');
    return;
  }

  const slug = (window.prompt('Product slug:', product.slug) || '').trim();
  if(!slug){
    showToast('⚠️ Product slug is required.','fail');
    return;
  }

  const type = (window.prompt('Product type (digital/template/course/vps_droplet):', product.type) || product.type).trim();
  const status = (window.prompt('Status (available/out-of-stock/coming-soon):', product.status) || product.status).trim();
  const shortDescription = (window.prompt('Short description (optional):', product.shortDescription || '') || '').trim();

  try {
    await requestJson(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        slug,
        product_type: type,
        status,
        short_description: shortDescription || null,
        is_visible: product.visible,
      }),
    });

    await loadBackendData();
    showToast('✅ Product updated.','ok');
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function toggleProductVisibility(productId){
  const product = getProductById(productId);
  if(!product){
    showToast('⚠️ Product not found in dashboard data.','fail');
    return;
  }

  try {
    await requestJson(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: product.name,
        slug: product.slug,
        product_type: product.type,
        status: product.status,
        short_description: product.shortDescription || null,
        is_visible: !product.visible,
      }),
    });

    await loadBackendData();
    showToast(`✅ Product ${product.visible ? 'hidden' : 'visible'}.`,'ok');
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

function viewProduct(productId){
  const product = getProductById(productId);
  if(!product){
    showToast('⚠️ Product not found in dashboard data.','fail');
    return;
  }

  openPayload(JSON.stringify(product));
}

async function viewOrder(orderId){
  try {
    const payload = await requestJson(`/api/admin/orders/${orderId}`);
    openPayload(JSON.stringify(payload.order || payload));
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function updateOrderStatus(orderId, currentStatus){
  const status = (window.prompt('Order status (pending/paid/fulfilled/cancelled):', currentStatus || 'pending') || '').trim().toLowerCase();
  if(!status){
    return;
  }

  try {
    await requestJson(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });

    await loadBackendData();
    showToast('✅ Order status updated.','ok');
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function viewUser(userId){
  try {
    const payload = await requestJson(`/api/admin/users/${userId}`);
    openPayload(JSON.stringify(payload.user || payload));
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function toggleUserAccess(userId, isBlocked){
  const shouldActivate = Boolean(isBlocked);

  try {
    await requestJson(`/api/admin/users/${userId}/access`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: shouldActivate }),
    });

    await loadBackendData();
    showToast(`✅ User ${shouldActivate ? 'unblocked' : 'blocked'}.`,'ok');
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function updateEntitlementStatus(entitlementId, status){
  const reason = (window.prompt('Reason (optional):') || '').trim();

  try {
    await requestJson(`/api/admin/entitlements/${entitlementId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        reason: reason || null,
      }),
    });

    await loadBackendData();
    showToast('✅ Entitlement updated.','ok');
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function extendEntitlement(entitlementId, days){
  try {
    await requestJson(`/api/admin/entitlements/${entitlementId}/extend`, {
      method: 'PUT',
      body: JSON.stringify({ days }),
    });

    await loadBackendData();
    showToast(`✅ Entitlement extended by ${days} days.`,'ok');
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function viewDropletActions(dropletId){
  try {
    const payload = await requestJson(`/api/admin/droplets/${dropletId}/actions`);
    openPayload(JSON.stringify({ droplet_id: dropletId, actions: payload.actions || [] }));
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

async function saveAllSettings(){
  const fields = Array.from(document.querySelectorAll('[data-setting-group][data-setting-key]'));
  if(fields.length === 0){
    showToast('⚠️ No settings fields found.','fail');
    return;
  }

  try {
    await Promise.all(fields.map((field) => {
      const value = field.type === 'checkbox' ? field.checked : field.value;
      return requestJson(API.settings, {
        method: 'PUT',
        body: JSON.stringify({
          setting_group: field.dataset.settingGroup,
          setting_key: field.dataset.settingKey,
          setting_value: { value },
        }),
      });
    }));

    showToast('✅ Settings saved and audit logged.','ok');
    await loadBackendData();
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  }
}

function openSupportDocs(){
  window.open('https://docs.digitalocean.com/reference/api/api-reference/', '_blank', 'noopener');
}

function openSystemStatus(){
  window.open('https://status.digitalocean.com/', '_blank', 'noopener');
}

function contactSupport(){
  window.location.href = 'mailto:support@digitalloka.dev';
}

function openSupportTicket(){
  window.location.href = 'mailto:support@digitalloka.dev?subject=Admin%20Support%20Ticket';
}

function renderAudit(){
  document.getElementById('audit-body').innerHTML = DATA.audit.map(e=>`<tr class="audit-row ${e.result}">
    <td class="mono">${e.id}</td>
    <td class="fw">${e.actor}</td>
    <td style="font-weight:700">${e.action}</td>
    <td><span class="tag">${e.ttype}</span></td>
    <td class="mono">${e.tid}</td>
    <td>${badge(e.result)}</td>
    <td style="color:var(--muted-foreground);font-size:0.72rem">${e.ts}</td>
    <td><button class="btn btn-sm btn-ghost" onclick="openPayload(${JSON.stringify(JSON.stringify(e.payload))})">Payload</button></td>
  </tr>`).join('');
}

/* ============================================================ DROPLET OPS */
function dropletOp(id,action){
  const key=String(id).replace('-','_');
  const row=document.getElementById('dr-'+key);
  if(!row)return;
  const btns=row.querySelectorAll('button');
  btns.forEach(b=>b.disabled=true);
  const msgs={on:'⚡ Powering on…',off:'🔌 Powering off…',reboot:'🔄 Rebooting…',refresh:'🔍 Refreshing…'};
  showToast(msgs[action],'warn');

  const actionMap = {
    on: 'power_on',
    off: 'power_off',
    reboot: 'reboot',
  };

  if(action === 'refresh'){
    loadBackendData()
      .then(()=>showToast('✅ Status refreshed.','ok'))
      .catch(()=>showToast('⚠️ Failed to refresh statuses.','fail'))
      .finally(()=>btns.forEach(b=>b.disabled=false));
    return;
  }

  fetch(`/api/admin/droplets/${id}/actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ type: actionMap[action] || 'reboot' }),
  }).then(async (response)=>{
    if(!response.ok){
      throw new Error(`Action request failed: ${response.status}`);
    }
    await loadBackendData();
    showToast('✅ Droplet action queued.','ok');
  }).catch(()=>{
    showToast('⚠️ Droplet action failed.','fail');
  }).finally(()=>{
    btns.forEach(b=>b.disabled=false);
  });
}

function refreshAll(){
  showToast('🔄 Refreshing all droplets…','warn');
  loadBackendData()
    .then(()=>showToast('✅ All statuses updated.','ok'))
    .catch(()=>showToast('⚠️ Refresh failed.','fail'));
}

async function handleLogout(redirectTo){
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    console.error('Logout request failed', error);
  }

  document.cookie = 'sb-access-token=; Path=/; Max-Age=0; SameSite=Lax';
  document.cookie = 'sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax';
  window.location.href = redirectTo;
}

function createProduct(){
  const form = document.getElementById('create-product-form');
  if(form){
    form.reset();
  }

  const nameField = document.getElementById('cp-name');
  const slugField = document.getElementById('cp-slug');
  const visibleField = document.getElementById('cp-visible');

  if(slugField){
    slugField.value = '';
  }
  if(visibleField){
    visibleField.value = 'visible';
  }

  nav('product-create', null);
  if(nameField){
    nameField.focus();
  }

  renderCreateProductTypeFields(document.getElementById('cp-type')?.value || 'digital');
}

async function submitCreateProduct(event){
  event.preventDefault();

  const name = (document.getElementById('cp-name')?.value || '').trim();
  const slugInput = document.getElementById('cp-slug');
  const type = (document.getElementById('cp-type')?.value || 'digital').trim();
  const status = (document.getElementById('cp-status')?.value || 'available').trim();
  const shortDescription = (document.getElementById('cp-short-description')?.value || '').trim();
  const isVisible = (document.getElementById('cp-visible')?.value || 'visible') === 'visible';
  const meta = collectTypeMetaFields();
  const payloadMeta = Object.keys(meta).length > 0 ? meta : undefined;
  const submitButton = document.getElementById('cp-submit');

  if(!name){
    showToast('⚠️ Product name is required.','fail');
    return;
  }

  const slug = ((slugInput?.value || slugify(name))).trim();
  if(!slug){
    showToast('⚠️ Product slug is required.','fail');
    return;
  }

  if(slugInput){
    slugInput.value = slug;
  }

  if(submitButton){
    submitButton.disabled = true;
  }

  try {
    await requestJson('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        name,
        slug,
        product_type: type,
        status,
        short_description: shortDescription || null,
        is_visible: isVisible,
        meta: payloadMeta,
      }),
    });

    nav('products', null);
    await loadBackendData();
    showToast('✅ Product created.','ok');
  } catch (error) {
    showToast(`⚠️ ${error.message}`,'fail');
  } finally {
    if(submitButton){
      submitButton.disabled = false;
    }
  }
}

function slugify(text){
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/* ============================================================ MODAL */
function openPayload(json){
  document.getElementById('modal-body').textContent=JSON.stringify(JSON.parse(json),null,2);
  document.getElementById('modal').classList.add('open');
}
function closeModal(e){
  if(e.target===document.getElementById('modal'))
    document.getElementById('modal').classList.remove('open');
}

/* ============================================================ TOAST */
let toastT;
function showToast(msg,type){
  const el=document.getElementById('toast');
  const bg={ok:getComputedStyle(document.documentElement).getPropertyValue('--quaternary').trim(),warn:'#FBBF24',fail:'#F472B6'};
  el.style.background=bg[type]||'var(--foreground)';
  el.style.color=type?'var(--foreground)':'#fff';
  el.style.borderColor='var(--foreground)';
  el.textContent=msg;
  el.style.display='flex';
  clearTimeout(toastT);
  toastT=setTimeout(()=>el.style.display='none',3000);
}

/* ============================================================ NAVIGATION */
function nav(page,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const t=document.getElementById('page-'+page);
  if(t)t.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(el)el.classList.add('active');
  else{const f=document.querySelector(`[data-page="${page}"]`);if(f)f.classList.add('active');}
  document.querySelector('.main').scrollTop=0;

  const pathMap = {
    overview: '/admin',
    products: '/admin/products',
    'product-create': '/admin/products/create',
    'product-types': '/admin/product-types',
    'product-stocks': '/admin/product-stocks',
    'product-stocks-manage': '/admin/product-stocks',
    'product-type-editor': '/admin/product-types/create',
    orders: '/admin/orders',
    users: '/admin/users',
    entitlements: '/admin/entitlements',
    droplets: '/admin/droplets',
    audit: '/admin/audit-logs',
    settings: '/admin/settings',
    account: '/admin/account',
    support: '/admin/support',
  };

  if(pathMap[page]){
    if(page === 'product-stocks-manage' && selectedStockProductId){
      window.history.replaceState({ page }, '', `/admin/products/${encodeURIComponent(selectedStockProductId)}/stocks`);
    } else {
      window.history.replaceState({ page }, '', pathMap[page]);
    }
  }

  if(page === 'product-stocks'){
    renderProductStockProducts();
  }

  if(page === 'product-stocks-manage'){
    updateProductStockManagementPanel();
    loadProductStocks();
  }

  if(pageNeedsHeavyData(page)){
    loadHeavyDataOnce().catch(()=>{
      showToast('⚠️ Failed to load full dashboard data.','fail');
    });
  }

  if(window.matchMedia('(max-width:900px)').matches){
    document.getElementById('sidebar')?.classList.remove('open');
  }
}

/* ============================================================ SIDEBAR TOGGLE */
document.getElementById('sbToggle').addEventListener('click',()=>{
  const sidebar = document.getElementById('sidebar');
  const app = document.getElementById('app');
  if(window.matchMedia('(max-width:900px)').matches){
    sidebar.classList.toggle('open');
    return;
  }

  sidebar.classList.toggle('collapsed');
  app.classList.toggle('collapsed');
});

document.querySelector('.main')?.addEventListener('click',()=>{
  if(window.matchMedia('(max-width:900px)').matches){
    document.getElementById('sidebar')?.classList.remove('open');
  }
});

/* ============================================================ INIT */
const initialPage = @json($initialPageValue);
const initialProductType = @json($initialProductTypeValue);
const initialStockProductId = @json($initialStockProductIdValue);
if(initialStockProductId){
  selectedStockProductId = String(initialStockProductId);
}
const startupPage = initialPage === 'product-stocks' && selectedStockProductId ? 'product-stocks-manage' : initialPage;
nav(startupPage, null);

loadBackendData().catch(()=>{
  showToast('⚠️ Loaded with fallback data. Backend unavailable.','fail');
});

if(initialPage === 'product-type-editor'){
  window.setTimeout(() => {
    if(initialProductType){
      openProductTypeEditor(initialProductType);
      return;
    }

    openProductTypeEditor();
  }, 0);
}
</script>
</body>
</html>
