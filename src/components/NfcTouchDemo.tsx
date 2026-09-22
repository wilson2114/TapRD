import React, { useState } from 'react';
import { Smartphone, Radio, CheckCircle2, ArrowRight, Sparkles, Zap } from 'lucide-react';

interface NfcTouchDemoProps {
  onOpenDemoProfile?: () => void;
}

export function NfcTouchDemo({ onOpenDemoProfile }: NfcTouchDemoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tapActive, setTapActive] = useState(false);

  const handleSimulateTap = () => {
    setTapActive(true);
    setTimeout(() => {
      setTapActive(false);
    }, 3200);
  };

  return (
    <div
      id="nfc-interactive-simulator"
      className="relative w-full max-w-[430px] mx-auto p-6 sm:p-7 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-blue-900/10 overflow-hidden"
    >
      {/* Decorative ambient subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar of simulator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Simulador NFC Interactivo
          </span>
        </div>
        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/60">
          En vivo
        </span>
      </div>

      {/* Main Interactive Stage */}
      <div
        className="relative h-88 flex items-center justify-center cursor-pointer select-none"
        onClick={handleSimulateTap}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Toca o haz clic para simular el toque NFC"
      >
        {/* Concentric NFC wave ripples */}
        {(tapActive || isHovered) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
            <div className="w-28 h-28 rounded-full border-2 border-cyan-400/60 animate-ping [animation-duration:1.8s]" />
            <div className="w-52 h-52 rounded-full border border-blue-500/40 animate-ping [animation-duration:2.2s] [animation-delay:200ms]" />
            <div className="w-76 h-76 rounded-full border border-blue-600/20 animate-ping [animation-duration:2.8s] [animation-delay:400ms]" />
          </div>
        )}

        {/* Smartphone Chassis - Hyper-realistic modern styling */}
        <div className="relative w-52 h-80 bg-slate-950 rounded-[2.8rem] p-2.5 shadow-2xl border-4 border-slate-800/90 flex flex-col z-10 transition-transform duration-300">
          {/* Dynamic Island Notch */}
          <div className="w-22 h-4.5 bg-black rounded-full mx-auto mb-1.5 flex items-center justify-between px-2">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />
            </div>
          </div>

          {/* Phone Screen Mockup */}
          <div className="flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-[2.2rem] p-3 text-white flex flex-col justify-between overflow-hidden relative border border-slate-800/50">
            
            {/* Native OS NFC Notification Banner */}
            <div
              className={`transition-all duration-500 transform ${
                tapActive || isHovered
                  ? 'translate-y-0 opacity-100 scale-100'
                  : '-translate-y-3 opacity-30 scale-95'
              } bg-slate-900/95 backdrop-blur-md p-2.5 rounded-2xl border border-cyan-400/40 shadow-xl shadow-cyan-950/40`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-cyan-300 tracking-tight">
                      TapRD NFC Detectado
                    </p>
                    <span className="text-[8px] text-slate-400 font-mono">Ahora</span>
                  </div>
                  <p className="text-[11px] font-bold text-white truncate">
                    Barbería Wilson • Santo Domingo
                  </p>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-[9px] text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="font-medium">Toca para abrir perfil digital</span>
                <span className="text-cyan-400 font-bold flex items-center">
                  Abrir <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                </span>
              </div>
            </div>

            {/* Screen Mockup Content State */}
            <div className="text-center py-2">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 mx-auto flex items-center justify-center text-cyan-400 mb-2 shadow-inner">
                <Smartphone className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-100">
                Lector NFC Listo
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Acerca cualquier tarjeta o placa TapRD
              </p>
            </div>

            {/* Tap Status Indicator */}
            <div className={`text-center py-1.5 px-2.5 rounded-xl border transition-colors ${
              tapActive 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-blue-950/40 border-blue-500/30 text-blue-300'
            }`}>
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold">
                {tapActive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Lectura instantánea exitosa!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>Listo para aproximación</span>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Floating NFC Metallic Business Card */}
        <div
          className={`absolute z-20 w-46 h-28 rounded-2xl p-3.5 text-white transition-all duration-700 ease-out transform shadow-2xl cursor-pointer card-metallic-dark ${
            tapActive
              ? 'translate-x-2 -translate-y-9 rotate-6 scale-105 shadow-cyan-500/40 ring-2 ring-cyan-400'
              : isHovered
              ? 'translate-x-14 -translate-y-5 rotate-12 scale-100 shadow-blue-900/50 ring-1 ring-blue-500/40'
              : 'translate-x-20 -translate-y-2 rotate-12 shadow-slate-900/60 ring-1 ring-slate-700'
          }`}
        >
          {/* Card Details & Microchip */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-tight text-white">
              Tap<span className="text-cyan-400">RD</span>
            </span>
            <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              <Radio className="w-3 h-3 text-cyan-300 animate-pulse" />
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-200">
                NFC Chip
              </span>
            </div>
          </div>

          <div className="mt-3.5 flex items-end justify-between">
            <div>
              {/* Metallic Chip Visual */}
              <div className="w-6 h-4.5 rounded bg-gradient-to-r from-amber-300 to-amber-500 border border-amber-200 mb-1.5 shadow-xs" />
              <p className="text-[11px] font-black tracking-wide text-white">
                Wilson Martínez
              </p>
              <p className="text-[8px] font-medium text-slate-400">Barbería Wilson • Pro</p>
            </div>
            <div className="w-7 h-7 rounded bg-white p-0.5 text-slate-900 flex items-center justify-center font-mono text-[7px] font-black">
              QR
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Bottom Actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={handleSimulateTap}
          className="inline-flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 active:scale-95 transition-all cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
          <span>Simular toque NFC</span>
        </button>

        {onOpenDemoProfile && (
          <button
            type="button"
            onClick={onOpenDemoProfile}
            className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors cursor-pointer"
          >
            <span>Ver perfil en pantalla completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

