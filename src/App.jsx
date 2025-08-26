import React, { useMemo, useState, useEffect } from 'react'

const initialOficiales = [
  {
    id: "alc-01",
    nombre: "Guillermo Morales Sanchez",
    cargo: "Alcalde Distrital",
    dependencia: "Despacho de Alcaldía",
    categoria: "Autoridades Ediles",
    email: "alcaldia@munismf.gob.pe",
    telefono: "073-000000",
    whatsapp: "+51900000000",
    foto: "",
    periodo: "2023 – 2026",
    ubicacion: "Palacio Municipal, 2° piso",
    orden: 1,
  },
  {
    id: "gm-01",
    nombre: "Econ. Lucero Xixa Rodríguez Gonzales",
    cargo: "Gerente Municipal",
    dependencia: "Gerencia Municipal",
    categoria: "Alta Dirección",
    email: "gerenciamunicipal@munismf.gob.pe",
    telefono: "073-000010",
    whatsapp: "+51900000010",
    foto: "",
    periodo: "2025",
    ubicacion: "Palacio Municipal, 2° piso",
    orden: 2,
  },
  {
    id: "gdsysm-01",
    nombre: "Pedro Augusto Ramírez Neira",
    cargo: "Gerente de Desarrollo Social y Servicios Municipales",
    dependencia: "GDSySM",
    categoria: "Gerencias y Subgerencias",
    email: "gdsysm@munismf.gob.pe",
    telefono: "073-000020",
    whatsapp: "+51973714680",
    foto: "",
    periodo: "2025",
    ubicacion: "Palacio Municipal, 2° piso",
    orden: 3,
  },
];

function initialsFromName(nombre) {
  const parts = (nombre || "")
    .replace(/\(Completar\)/gi, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

function normalize(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function formatPhoneLink(num) {
  if (!num) return "";
  const digits = num.replace(/\D/g, "");
  return `tel:${digits}`;
}

function formatWhatsApp(num) {
  if (!num) return "";
  const digits = num.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export default function App() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todas");
  const [orden, setOrden] = useState("orden");
  const [oficiales, setOficiales] = useState(initialOficiales);

  // Cargar automáticamente el directorio desde /public respetando BASE_URL (GitHub Pages)
  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}directorio_autoridades.json`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const map = new Map();
          [...initialOficiales, ...data].forEach(item => map.set(item.id || `${item.nombre}-${item.cargo}`, item));
          setOficiales(Array.from(map.values()));
        }
      } catch (e) { /* ignore */ }
    }
    cargar();
  }, []);

  const categorias = useMemo(() => {
    const set = new Set(oficiales.map((o) => o.categoria).filter(Boolean));
    return ["todas", ...Array.from(set)];
  }, [oficiales]);

  const filtrados = useMemo(() => {
    const nq = normalize(q);
    let arr = oficiales.filter((o) => {
      const okCat = cat === "todas" || o.categoria === cat;
      const haystack = normalize(
        `${o.nombre} ${o.cargo} ${o.dependencia} ${o.email} ${o.telefono}`
      );
      const okQ = !nq || haystack.includes(nq);
      return okCat && okQ;
    });

    switch (orden) {
      case "nombre":
        arr.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "cargo":
        arr.sort((a, b) => a.cargo.localeCompare(b.cargo));
        break;
      default:
        arr.sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
    }
    return arr;
  }, [q, cat, orden, oficiales]);

  const hoy = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "2-digit" });
  }, []);

  function descargarJSON() {
    const blob = new Blob([JSON.stringify(oficiales, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "directorio_autoridades.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importarJSON(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result || "[]"));
        if (Array.isArray(data)) setOficiales(data);
        else alert("El archivo no contiene un arreglo válido.");
      } catch (err) {
        alert("No se pudo leer el JSON.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-orange-500 to-red-500 opacity-90 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 py-14 text-white">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}escudo-mdsmf.png`} alt="Escudo MDSMF" className="h-12 w-12 rounded-lg ring-2 ring-white/60 bg-white/80 p-1" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Directorio de Autoridades
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-white/90">
            Directorio de Autoridades del distrito de San Miguel de El Faique
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => window.print()} className="rounded-2xl bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20 transition">Imprimir</button>
            <button onClick={descargarJSON} className="rounded-2xl bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20 transition">Exportar JSON</button>
            <label className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20 transition">
              Importar JSON
              <input type="file" accept="application/json" className="hidden" onChange={importarJSON} />
            </label>
          </div>
          <p className="mt-4 text-xs text-white/80">Actualizado: {hoy}</p>
        </div>
      </header>

      <section className="controls relative z-10 mx-auto max-w-7xl px-6 mt-6">
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre, cargo, dependencia, correo…"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500"
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ordenar por</label>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="orden">Prioridad</option>
                <option value="nombre">Nombre</option>
                <option value="cargo">Cargo</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 mt-3">
        <div className="flex flex-wrap gap-2">
          {["todas","Autoridades Ediles","Alta Dirección","Gerencias y Subgerencias","IAL-DIS 2024"].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1 text-sm border transition ${cat===c ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <DirectorioGrid items={filtrados} />
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-10 text-sm text-gray-500">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p>* Este directorio es referencial. Para rectificaciones o actualizaciones, comuníquese con Secretaría General.</p>
        </div>
      </footer>

      <style>{`
        @media print {
          header, footer, section { display: none; }
          main { padding: 0; }
          .card { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

function DirectorioGrid({ items }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
        No se encontraron resultados. Ajusta los filtros o comprueba tu búsqueda.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((o) => (
        <TarjetaOficial key={o.id} o={o} />
      ))}
    </div>
  );
}

function TarjetaOficial({ o }) {
  const hasFoto = Boolean(o.foto);
  const avatar = hasFoto ? (
    <img src={o.foto} alt={`Foto de ${o.nombre}`} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white" />
  ) : (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-lime-500 text-white ring-2 ring-white">
      <span className="text-lg font-bold">{initialsFromName(o.nombre) || "?"}</span>
    </div>
  );

  return (
    <article className="card group relative rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        {avatar}
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-gray-900">{o.nombre}</h3>
          <p className="text-sm text-emerald-700">{o.cargo}</p>
          <p className="text-xs text-gray-500">{o.dependencia}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        {o.periodo && (
          <div className="flex items-center gap-2">
            <IconCalendar />
            <div><dt className="sr-only">Periodo</dt><dd>{o.periodo}</dd></div>
          </div>
        )}
        {o.ubicacion && (
          <div className="flex items-center gap-2">
            <IconMap />
            <div><dt className="sr-only">Ubicación</dt><dd>{o.ubicacion}</dd></div>
          </div>
        )}
        {o.email && (
          <div className="flex items-center gap-2">
            <IconMail />
            <div className="flex flex-wrap items-center gap-2">
              <a href={`mailto:${o.email}`} className="truncate text-emerald-700 hover:underline" title={o.email}>{o.email}</a>
              <button onClick={() => navigator.clipboard.writeText(o.email)} className="rounded-lg border border-emerald-200 px-2 py-0.5 text-xs text-emerald-700 hover:bg-emerald-50" title="Copiar correo">Copiar</button>
            </div>
          </div>
        )}
        {o.telefono && (
          <div className="flex items-center gap-2">
            <IconPhone />
            <a href={formatPhoneLink(o.telefono)} className="text-gray-700 hover:underline">{o.telefono}</a>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {(o.whatsapp || o.telefono) && (
          <a href={formatWhatsApp(o.whatsapp || o.telefono)} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">WhatsApp</a>
        )}
        {o.email && (
          <a href={`mailto:${o.email}`} className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Enviar correo</a>
        )}
      </div>
    </article>
  );
}

// Icons
function IconMail(props){ return (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>); }
function IconPhone(props){ return (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h2a2 2 0 0 1 2 1.72c.12.9.33 1.78.61 2.63a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.45-1.12a2 2 0 0 1 2.11-.45c.85.28 1.73.49 2.63.61A2 2 0 0 1 22 16.92z" /></svg>); }
function IconMap(props){ return (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M1 6l7-3 8 3 7-3v15l-7 3-8-3-7 3z" /><path d="M8 3v15" /><path d="M16 6v15" /></svg>); }
function IconCalendar(props){ return (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>); }
