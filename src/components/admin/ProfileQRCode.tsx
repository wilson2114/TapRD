import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, ExternalLink, Check, QrCode } from 'lucide-react';

interface ProfileQRCodeProps {
  url: string;
  businessName: string;
  size?: number;
  onOpenProfile?: () => void;
}

export function ProfileQRCode({ url, businessName, size = 180, onOpenProfile }: ProfileQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#0f172a', // Slate-900
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      },
      (err) => {
        if (err) {
          console.error('Error generating QR code:', err);
          setError('No se pudo generar el código QR');
        } else {
          setError(null);
        }
      }
    );
  }, [url, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      const sanitizedName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      a.download = `qr-taprd-${sanitizedName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Error downloading QR:', e);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <QrCode className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
          QR del perfil digital
        </span>
      </div>

      {/* QR Canvas frame */}
      <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center mb-4">
        {error ? (
          <div className="w-40 h-40 flex items-center justify-center text-xs text-rose-500 font-bold">
            {error}
          </div>
        ) : (
          <canvas ref={canvasRef} className="rounded-xl shadow-2xs" />
        )}
      </div>

      <p className="text-[11px] text-slate-500 font-medium max-w-xs mb-4">
        Escanea este código con cualquier teléfono para abrir el perfil digital de {businessName}.
      </p>

      {/* Action Buttons: Descargar QR, Copiar enlace, Ver perfil */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:w-auto flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar QR</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full sm:w-auto flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copiar enlace</span>
            </>
          )}
        </button>

        {onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-full sm:w-auto flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver perfil</span>
          </button>
        )}
      </div>
    </div>
  );
}
