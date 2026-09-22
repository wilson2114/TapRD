import React, { useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ClientDayHours } from '../../types/client';
import { 
  Save, 
  Check, 
  AlertCircle, 
  Clock, 
  Copy, 
  Sparkles,
  Calendar
} from 'lucide-react';

interface ClientHoursPageProps {
  onNavigate: (path: string) => void;
}

const DEFAULT_DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

export function ClientHoursPage({ onNavigate }: ClientHoursPageProps) {
  const { client, updateClient } = useClientAuth();

  const [hours, setHours] = useState<ClientDayHours[]>(() => {
    if (client?.hours && client.hours.length > 0) {
      return client.hours;
    }
    return DEFAULT_DAYS.map((day) => ({
      day,
      isOpen: day !== 'Domingo',
      openTime: '09:00',
      closeTime: '19:00',
      display: day === 'Domingo' ? 'Cerrado' : '9:00 AM – 7:00 PM'
    }));
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!client) return null;

  const handleToggleDayOpen = (index: number) => {
    const updated = [...hours];
    updated[index].isOpen = !updated[index].isOpen;
    if (!updated[index].isOpen) {
      updated[index].display = 'Cerrado';
    } else {
      updated[index].display = `${updated[index].openTime || '09:00'} – ${updated[index].closeTime || '19:00'}`;
    }
    setHours(updated);
  };

  const handleHourTimeChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    const updated = [...hours];
    updated[index][field] = value;
    if (updated[index].isOpen) {
      updated[index].display = `${updated[index].openTime || '09:00'} – ${updated[index].closeTime || '19:00'}`;
    }
    setHours(updated);
  };

  const handleCopyMondayToWeekdays = () => {
    const monday = hours[0];
    if (!monday) return;
    const updated = hours.map((item, idx) => {
      // Lunes a Viernes (indices 0 a 4)
      if (idx <= 4) {
        return {
          ...item,
          isOpen: monday.isOpen,
          openTime: monday.openTime,
          closeTime: monday.closeTime,
          display: monday.display
        };
      }
      return item;
    });
    setHours(updated);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const updated = await updateClient({
        hours
      });
      if (updated) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage('No se pudieron guardar los horarios.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando en Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ClientLayout
      currentPath="/cliente/horarios"
      onNavigate={onNavigate}
      title="Horario Comercial"
      subtitle="Configura los días y horas en que tu negocio atiende a sus clientes."
      actions={
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          <span>{isSaving ? 'Guardando...' : 'Guardar horario'}</span>
        </button>
      }
    >
      <div className="space-y-6">

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>¡Horario comercial actualizado y sincronizado en tu perfil digital NFC!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tabla de Horarios */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Horario de Atención Semanal</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Marca los días abiertos e ingresa la hora de apertura y cierre.</p>
            </div>

            <button
              type="button"
              onClick={handleCopyMondayToWeekdays}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              title="Copiar horario de Lunes a toda la semana laboral"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Copiar Lunes a Lun-Vie</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {hours.map((item, index) => (
              <div key={item.day} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                
                {/* Día e Interruptor */}
                <div className="flex items-center gap-3 w-36">
                  <button
                    type="button"
                    onClick={() => handleToggleDayOpen(index)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                      item.isOpen ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    {item.isOpen && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <span className={`font-black ${item.isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                    {item.day}
                  </span>
                </div>

                {/* Selectores de Hora */}
                <div className="flex items-center gap-2">
                  {item.isOpen ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">De:</span>
                        <input
                          type="time"
                          value={item.openTime || '09:00'}
                          onChange={(e) => handleHourTimeChange(index, 'openTime', e.target.value)}
                          className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium focus:bg-white dark:focus:bg-slate-700"
                        />
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">a</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="time"
                          value={item.closeTime || '19:00'}
                          onChange={(e) => handleHourTimeChange(index, 'closeTime', e.target.value)}
                          className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium focus:bg-white dark:focus:bg-slate-700"
                        />
                      </div>
                    </>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-xl text-xs">
                      Cerrado todo el día
                    </span>
                  )}
                </div>

                {/* Previsualización del texto */}
                <div className="text-left sm:text-right text-slate-500 dark:text-slate-400 text-[11px] font-medium sm:w-44">
                  {item.isOpen ? item.display : 'Cerrado'}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Botón Guardar Pie */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando horario...' : 'Guardar y aplicar cambios'}</span>
          </button>
        </div>

      </div>
    </ClientLayout>
  );
}
