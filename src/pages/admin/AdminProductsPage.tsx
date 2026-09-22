import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PRODUCTS } from '../../data/products';
import { Product } from '../../types';
import { Package, Plus, ExternalLink, Check, Sparkles, Tag, Layers } from 'lucide-react';

interface AdminProductsPageProps {
  onNavigate: (path: string) => void;
}

export function AdminProductsPage({ onNavigate }: AdminProductsPageProps) {
  return (
    <AdminLayout
      currentPath="/admin/productos"
      onNavigate={onNavigate}
      title="Catálogo de Hardware NFC"
      subtitle="Administración de tarjetas, placas y stickers NFC disponibles para clientes en República Dominicana."
      actions={
        <button
          type="button"
          onClick={() => onNavigate('/productos')}
          className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Ver catálogo público</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
                    {prod.category}
                  </span>
                  <span className="text-xs font-mono font-black text-slate-900">
                    {prod.priceFrom}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-950">
                  {prod.name}
                </h3>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                  {prod.shortDescription}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <p><strong>Chip:</strong> {prod.specs.chip}</p>
                  <p><strong>Material:</strong> {prod.material}</p>
                  <p><strong>Garantía:</strong> {prod.specs.warranty}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate(prod.route)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ficha comercial</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Note on Future Commerce / Inventory */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Módulo de Inventario & Pedidos (Fase SaaS)</span>
          </div>
          <h3 className="text-lg font-black">
            Integración de Pasarelas de Pago Dominicanas & Control de Stock
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {/*
              TODO: Conectar inventario en tiempo real con proveedores de hardware NFC,
              pasarela Azul / CardNET / Stripe para pagos en RD$ y USD,
              y generación automática de órdenes de despacho físico.
            */}
            La arquitectura de datos de TapRD ya cuenta con los tipos de datos necesarios para cupones, 
            descuentos por volumen e inventario de hardware.
          </p>
        </div>

      </div>
    </AdminLayout>
  );
}
