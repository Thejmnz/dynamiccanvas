"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="dark min-h-screen bg-[#101622] text-slate-100 antialiased selection:bg-[#135bec]/30">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#101622]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-[#135bec] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                DC
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">Dynamic Canvas</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#features">Características</a>
              <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#pricing">Precios</a>
              <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#docs">Documentación</a>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="bg-[#135bec] hover:bg-[#135bec]/90 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-lg shadow-[#135bec]/20"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-sm font-semibold text-white px-4 py-2 hover:bg-white/5 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="bg-[#135bec] hover:bg-[#135bec]/90 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-lg shadow-[#135bec]/20"
                  >
                    Empezar Gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-24 overflow-hidden bg-[#101622]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#135bec]/40 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-blue-600/30 blur-[100px] rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className="flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#135bec]/10 border border-[#135bec]/20 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#135bec] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#135bec]"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#135bec]">v2.0 ya disponible</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                Crea Diseños Asombrosos a Escala con una <span className="text-[#135bec]">Simple API</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
                Automatiza tu flujo de trabajo creativo. Integra herramientas de diseño directamente en tu stack tecnológico y genera visuales dinámicos en segundos.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href={user ? "/dashboard" : "/sign-up"}
                  className="bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold h-14 px-8 rounded-xl transition-all shadow-xl shadow-[#135bec]/25 flex items-center gap-2"
                >
                  Empezar Gratis <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link
                  href="/api-integration"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold h-14 px-8 rounded-xl transition-all flex items-center gap-2"
                >
                  Ver Demo en Vivo <span className="material-symbols-outlined">play_circle</span>
                </Link>
              </div>
                          </div>

            {/* Hero Visual (Split View) */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#135bec] to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Visual Editor Side */}
                <div className="bg-[#1e1e24] p-6 flex flex-col gap-4 border-r border-white/5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Editor Visual</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                    </div>
                  </div>
                  <div className="relative aspect-square bg-[#2a2a32] rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full p-4 flex flex-col gap-4">
                      <div className="w-full h-32 rounded bg-gradient-to-br from-[#135bec]/40 to-blue-500/40 border border-[#135bec]/20 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white/50 !text-4xl">image</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                        <div className="h-2 w-1/2 bg-white/5 rounded"></div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <div className="w-6 h-6 bg-[#135bec] rounded shadow flex items-center justify-center text-white"><span className="material-symbols-outlined !text-sm">layers</span></div>
                      <div className="w-6 h-6 bg-slate-700 rounded shadow flex items-center justify-center text-white"><span className="material-symbols-outlined !text-sm">edit</span></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/5">
                      <div className="w-3 h-3 rounded-sm bg-[#135bec]"></div>
                      <span className="text-[11px] text-slate-300">Cuerpo de Texto</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/5 opacity-50">
                      <div className="w-3 h-3 rounded-sm bg-blue-300"></div>
                      <span className="text-[11px] text-slate-300">Botón Primario</span>
                    </div>
                  </div>
                </div>

                {/* Code Editor Side */}
                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 font-mono text-[12px] leading-relaxed overflow-hidden">
                  <div className="flex items-center justify-between pb-2 mb-4 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">JSON Payload</span>
                    <span className="text-[#135bec]/70">POST /render</span>
                  </div>
                  <div className="text-blue-300">
                    {`{`}
                    <br/>
                    &nbsp;&nbsp;<span className="text-[#135bec]">"template_id"</span>: <span className="text-green-400">"hero_banner"</span>,<br/>
                    &nbsp;&nbsp;<span className="text-[#135bec]">"modifications"</span>: [<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{`{`}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#135bec]">"name"</span>: <span className="text-green-400">"title"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#135bec]">"text"</span>: <span className="text-green-400">"New Launch!"</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{`}`},<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{`{`}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#135bec]">"name"</span>: <span className="text-green-400">"color"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#135bec]">"hex"</span>: <span className="text-green-400">"#135BEC"</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{`}`}<br/>
                    &nbsp;&nbsp;],<br/>
                    &nbsp;&nbsp;<span className="text-[#135bec]">"format"</span>: <span className="text-green-400">"png"</span><br/>
                    {`}`}
                  </div>
                  <div className="mt-6 flex items-center justify-end">
                    <span className="px-2 py-1 rounded bg-[#135bec]/20 text-[#135bec] text-[10px] font-bold">200 OK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0d1320]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-[#135bec] font-bold uppercase tracking-widest text-sm mb-4">Capacidades Core</h2>
            <h3 className="text-4xl font-black text-white leading-tight">Potencia tu Flujo de Trabajo</h3>
            <p className="text-slate-400 mt-4 text-lg">Herramientas diseñadas por desarrolladores para desarrolladores que no quieren comprometer la calidad visual.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-[#135bec]/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">draw</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Editor Visual Pro</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Capacidad de arrastrar y soltar para que tu equipo creativo diseñe sin tocar una sola línea de código.
              </p>
            </div>
            {/* Card 2 */}
            <div className="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-[#135bec]/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">variable_insert</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Plantillas Vivas</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Variables dinámicas dentro de tus archivos de diseño. Cambia textos, imágenes y colores en tiempo real.
              </p>
            </div>
            {/* Card 3 */}
            <div className="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-[#135bec]/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Renderizado Flash</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generación de imágenes en menos de un segundo gracias a nuestro motor de renderizado distribuido.
              </p>
            </div>
            {/* Card 4 */}
            <div className="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-[#135bec]/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Seguridad Enterprise</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Autenticación avanzada, cifrado de extremo a extremo y cumplimiento de normativas globales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#101622]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#135bec] to-blue-700 p-12 lg:p-20 text-center">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs><pattern height="10" id="grid" patternUnits="userSpaceOnUse" width="10"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"></path></pattern></defs>
                <rect fill="url(#grid)" height="100" width="100"></rect>
              </svg>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 relative z-10">
              ¿Listo para automatizar tu diseño?
            </h2>
            <p className="text-blue-100 text-lg lg:text-xl mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
              Únete a miles de desarrolladores que ya están escalando su producción visual sin fricción. Comienza hoy mismo gratis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href={user ? "/dashboard" : "/sign-up"}
                className="bg-white text-[#135bec] hover:bg-slate-100 font-extrabold h-16 px-10 rounded-xl transition-all shadow-2xl flex items-center justify-center gap-2 text-lg"
              >
                Empezar Gratis ahora <span className="material-symbols-outlined">rocket_launch</span>
              </Link>
              <button className="bg-[#135bec]/20 backdrop-blur border border-white/20 text-white hover:bg-white/10 font-bold h-16 px-10 rounded-xl transition-all flex items-center justify-center gap-2 text-lg">
                Hablar con Ventas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-16 pb-8 bg-[#101622]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-[#135bec] rounded flex items-center justify-center text-white font-bold text-xs">
                  DC
                </div>
                <span className="text-lg font-bold text-white">Dynamic Canvas</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                La infraestructura de diseño programático definitiva para productos digitales modernos.
              </p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Producto</h5>
              <ul className="space-y-4">
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#features">Características</a></li>
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#docs">API Reference</a></li>
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#">Changelog</a></li>
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#">SLA</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Recursos</h5>
              <ul className="space-y-4">
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#docs">Documentación</a></li>
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#">Comunidad</a></li>
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#">Guías</a></li>
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#">Status</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Legal</h5>
              <ul className="space-y-4">
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#">Privacidad</a></li>
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#">Términos</a></li>
                <li><a className="text-slate-500 hover:text-[#135bec] transition-colors text-sm" href="#">Seguridad</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs">© 2025 Dynamic Canvas. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <a className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all" href="#">
                <span className="material-symbols-outlined !text-base">terminal</span>
              </a>
              <a className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all" href="#">
                <span className="material-symbols-outlined !text-base">public</span>
              </a>
              <a className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all" href="#">
                <span className="material-symbols-outlined !text-base">alternate_email</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
