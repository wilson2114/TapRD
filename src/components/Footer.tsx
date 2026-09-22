import React from 'react';
import { Smartphone, Radio, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenContact: () => void;
}

export function Footer({ onNavigate, onOpenContact }: FooterProps) {
  return (
    <footer id="main-footer" className="bg-slate-900 dark:bg-slate-950 text-white pt-16 pb-12 border-t border-slate-800 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                <span className="text-xl tracking-tighter">T</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 ml-0.5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Tap<span className="text-blue-400">RD</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Soluciones NFC y perfiles digitales para negocios, profesionales y emprendedores en República Dominicana.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Santo Domingo, República Dominicana</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition-colors"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/productos')}
                  className="hover:text-white transition-colors font-bold text-slate-300"
                >
                  Catálogo de Productos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/productos/tap-card')}
                  className="hover:text-white transition-colors"
                >
                  Tap Card (Tarjeta NFC)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/productos/tap-business')}
                  className="hover:text-white transition-colors"
                >
                  Tap Business (Placa)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/productos/tap-review')}
                  className="hover:text-white transition-colors"
                >
                  Tap Review (Reseñas)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/productos/tap-sticker')}
                  className="hover:text-white transition-colors"
                >
                  Tap Sticker (Adhesivo)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="hover:text-white transition-colors"
                >
                  Contacto y Cotizaciones
                </button>
              </li>
              <li>
                <a
                  href="/#como-funciona"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/#como-funciona');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Cómo funciona
                </a>
              </li>
            </ul>
          </div>

          {/* Demos and Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Demos & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/demo/barberia')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Demo: Barbería Wilson</span>
                  <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 rounded">Ver</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/demo/restaurante')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Demo: Restaurante Mare Nostrum</span>
                  <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 rounded">Ver</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/demo/inmobiliaria')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Demo: Inmobiliaria Aura</span>
                  <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 rounded">Ver</span>
                </button>
              </li>
              <li className="pt-2">
                <button
                  id="footer-link-cliente-login"
                  type="button"
                  onClick={() => onNavigate('/cliente/login')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Portal de Clientes (Mi Negocio)</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-admin-login"
                  type="button"
                  onClick={() => onNavigate('/admin/login')}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Acceso Administrativo (Login)</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-admin-register"
                  type="button"
                  onClick={() => onNavigate('/admin/registro')}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Registrarme como Admin</span>
                </button>
              </li>
              <li>
                <span className="text-xs text-slate-600">Privacidad • Términos</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TapRD. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Hecho con dedicación para negocios en República Dominicana 🇩🇴</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
