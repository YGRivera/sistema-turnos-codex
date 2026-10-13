"use client";
import { useState } from "react";
import { Activity, ArrowRight, Bell, Check, Clock3, Headphones, LayoutDashboard, Monitor, Plus, Radio, Settings2, ShieldCheck, Ticket, Users, Volume2, Zap } from "lucide-react";
import { useQueue } from "../hooks/use-queue";
import { formatTicket } from "../lib/queue";

type View = "tickets" | "operator" | "display";
const navItems: { id: View; label: string; icon: typeof Ticket }[] = [
  { id: "tickets", label: "Tomar turno", icon: Ticket },
  { id: "operator", label: "Panel operador", icon: LayoutDashboard },
  { id: "display", label: "Pantalla pública", icon: Monitor },
];

export default function Home() {
  const [view, setView] = useState<View>("tickets");
  const [module, setModule] = useState(1);
  const [issued, setIssued] = useState<number | null>(null);
  const [called, setCalled] = useState(false);
  const { queue, ready, error, takeTicket, callNext } = useQueue();
  const handleTake = async () => { try { setIssued(await takeTicket()); setCalled(false); } catch { /* Shared error message is shown below. */ } };
  const handleCall = async () => { if (!queue.waiting.length) return; try { await callNext(module); setCalled(true); } catch { /* Shared error message is shown below. */ } };

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><span>t</span></div><div><strong>turnia</strong><small>QUEUE MANAGEMENT</small></div></div>
      <div className="workspace"><div className="workspace-avatar">A</div><div className="workspace-copy"><strong>Atención central</strong><span>Sucursal Reforma</span></div><span className="chevrons">⌃<br/>⌄</span></div>
      <div className="nav-label">ESPACIO DE TRABAJO</div>
      <nav className="main-nav" aria-label="Vistas">
        {navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setView(id)} className={`nav-item ${view === id ? "active" : ""}`}><Icon size={18}/><span>{label}</span>{id === "operator" && <span className="nav-count">{queue.waiting.length}</span>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="nav-label">SISTEMA</div><button className="nav-item muted"><Settings2 size={18}/><span>Configuración</span></button><div className="help-card"><div className="help-icon"><Headphones size={17}/></div><strong>¿Necesitas ayuda?</strong><p>Estamos para ayudarte a mejorar tu atención.</p><button>Contactar soporte <ArrowRight size={14}/></button></div><div className="profile"><div className="profile-avatar">MC</div><div className="profile-copy"><strong>María Castillo</strong><span>Administradora</span></div><span className="dots">•••</span></div></div>
    </aside>

    <section className="main-area">
      <header className="topbar"><div className="breadcrumb"><span>Atención central</span><span className="slash">/</span><strong>{navItems.find(item => item.id === view)?.label}</strong></div><div className="top-actions"><div className="live-pill"><i/> Sistema en línea</div><button className="icon-button" aria-label="Notificaciones"><Bell size={18}/><i/></button><div className="top-avatar">MC</div></div></header>
      <div className="page-content">
        {error && <div className="issued-toast" role="alert"><div><strong>Problema de conexión</strong><span>{error}</span></div></div>}
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>{view === "tickets" ? "BIENVENIDO A TURNIA" : view === "operator" ? "CENTRO DE OPERACIONES" : "INFORMACIÓN EN VIVO"}</div><h1>{view === "tickets" ? <>Tu tiempo importa.<br/><span>Toma tu turno.</span></> : view === "operator" ? <>Panel de <span>atención.</span></> : <>Turnos en <span>atención.</span></>}</h1><p>{view === "tickets" ? "Obtén tu turno en segundos y espera a que te llamemos." : view === "operator" ? "Gestiona la fila y brinda una atención excepcional." : "Sigue en tiempo real los turnos que estamos atendiendo."}</p></div><div className="date-block"><div className="date-dot"/>Sucursal abierta <span>·</span> Lun – Vie, 9:00 – 18:00</div></div>
        <div className="metrics-grid">
          <article className="metric-card"><div className="metric-top"><span>EN ESPERA</span><span className="metric-icon blue"><Users size={17}/></span></div><div className="metric-number">{ready ? String(queue.waiting.length).padStart(2,"0") : "—"}</div><div className="metric-foot"><span className="metric-trend"><Activity size={13}/> Fila activa</span><span>Clientes esperando</span></div></article>
          <article className="metric-card"><div className="metric-top"><span>ATENDIENDO AHORA</span><span className="metric-icon green"><Radio size={17}/></span></div><div className="metric-number ticket-metric">{queue.current ? formatTicket(queue.current.number) : "— —"}</div><div className="metric-foot"><span className="status-dot"/> {queue.current ? `Módulo ${queue.current.module}` : "Sin turno activo"}</div></article>
          <article className="metric-card"><div className="metric-top"><span>ÚLTIMO EMITIDO</span><span className="metric-icon violet"><Ticket size={17}/></span></div><div className="metric-number ticket-metric">{queue.nextNumber > 1 ? formatTicket(queue.nextNumber - 1) : "— —"}</div><div className="metric-foot"><span className="metric-trend"><Zap size={13}/> Consecutivo</span><span>Actualización automática</span></div></article>
          <article className="metric-card"><div className="metric-top"><span>TIEMPO PROMEDIO</span><span className="metric-icon amber"><Clock3 size={17}/></span></div><div className="metric-number">08<span className="metric-unit"> min</span></div><div className="metric-foot"><span className="metric-trend">● Estable</span><span>Últimos 30 minutos</span></div></article>
        </div>

        <div className="content-grid">
          <section className={`primary-card ${view === "display" ? "public-card" : ""}`}>
            <div className="card-heading"><div><div className="card-title-row"><h2>{view === "tickets" ? "Solicita tu turno" : view === "operator" ? "Control de fila" : "Ahora atendiendo"}</h2><span className="live-tag"><i/> EN VIVO</span></div><p>{view === "tickets" ? "Un solo paso para recibir la atención que necesitas." : view === "operator" ? "Llama al siguiente cliente cuando estés listo." : "Los turnos llamados se actualizan automáticamente."}</p></div><span className="card-icon"><Ticket size={18}/></span></div>
            {view === "tickets" ? <div className="take-panel"><div className="take-decoration"><div className="ticket-art"><span className="ticket-art-letter">A</span><span className="ticket-art-dash"/><span className="ticket-art-num">{queue.nextNumber.toString().padStart(3,"0")}</span><div className="ticket-art-hole"/></div><div className="sparkle s1">✳</div><div className="sparkle s2">✦</div><div className="sparkle s3">·</div></div><div className="take-copy"><span className="small-overline">ATENCIÓN GENERAL</span><h3>Evita la fila.<br/>Te llamamos nosotros.</h3><p>Presiona el botón para generar tu turno. Manténlo a la vista para saber cuándo es tu momento.</p><button className="primary-button" onClick={handleTake} disabled={!ready}><Plus size={18}/> Tomar turno <ArrowRight size={17}/></button><div className="secure-note"><ShieldCheck size={14}/> Gratis, fácil y sin registro</div></div>{issued !== null && <div className="issued-toast"><span className="issued-check"><Check size={15}/></span><div><strong>¡Tu turno está listo!</strong><span>Tu número es <b>{formatTicket(issued)}</b>. Te avisaremos en pantalla.</span></div><button onClick={() => setIssued(null)} aria-label="Cerrar">×</button></div>}</div> : view === "operator" ? <div className="operator-panel"><div className="current-ticket"><div className="current-label"><span className="pulse"/> TURNO EN ATENCIÓN</div><div className="current-number">{queue.current ? formatTicket(queue.current.number) : "— — —"}</div><div className="current-module"><span className="module-icon"><Monitor size={15}/></span>Módulo {queue.current?.module ?? module}<span className="current-time">{queue.current ? new Date(queue.current.calledAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "Esperando turno"}</span></div></div><div className="operator-controls"><label htmlFor="module-select">VENTANILLA / MÓDULO</label><select id="module-select" value={module} onChange={e => setModule(Number(e.target.value))}>{[1,2,3,4].map(n => <option key={n} value={n}>Módulo {n}</option>)}</select><button className="primary-button call-button" onClick={handleCall} disabled={!queue.waiting.length || !ready}><Volume2 size={18}/> Atender siguiente turno <ArrowRight size={17}/></button>{called && <span className="call-feedback"><Check size={14}/> Turno llamado correctamente</span>}</div><div className="queue-summary"><div><span className="summary-number">{String(queue.waiting.length).padStart(2,"0")}</span><span className="summary-label">personas en espera</span></div><div className="queue-next"><span className="summary-label">SIGUIENTE</span><strong>{queue.waiting.length ? formatTicket(queue.waiting[0]) : "— — —"}</strong></div></div></div> : <div className="public-display"><div className="public-label"><span className="pulse"/> TURNO LLAMADO</div><div className="public-number">{queue.current ? formatTicket(queue.current.number) : "— — —"}</div><div className="public-module"><span className="module-icon"><Monitor size={16}/></span> Acércate al <strong>Módulo {queue.current?.module ?? "—"}</strong></div><div className="public-wave"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></div>}
          </section>
          <section className="history-card"><div className="history-heading"><div><h2>Últimos llamados</h2><p>Historial reciente de atención</p></div><button className="more-button" aria-label="Más opciones">•••</button></div><div className="history-list">{queue.recent.length ? queue.recent.map((item, index) => <div className="history-item" key={`${item.number}-${item.calledAt}`}><div className={`history-icon ${index === 0 ? "latest" : ""}`}><Ticket size={16}/></div><div className="history-ticket"><strong>{formatTicket(item.number)}</strong><span>{new Date(item.calledAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span></div><div className="history-module">Módulo {item.module}</div><span className={`history-status ${index === 0 ? "serving" : "done"}`}>{index === 0 ? "Atendiendo" : "Finalizado"}</span></div>) : <div className="empty-history"><div className="empty-icon"><Clock3 size={19}/></div><strong>Aún no hay llamados</strong><span>Cuando se llame un turno, aparecerá aquí.</span></div>}</div><button className="history-link" onClick={() => setView("display")}>Ver pantalla pública <ArrowRight size={15}/></button></section>
        </div>
        <footer className="page-footer"><span>© 2025 Turnia Technologies</span><div><span><i/> Sincronizado en tiempo real</span><span className="footer-sep"/> <span>Hecho para atender mejor <span className="heart">♥</span></span></div></footer>
      </div>
    </section>
  </main>;
}

