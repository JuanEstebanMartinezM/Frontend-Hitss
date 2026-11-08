import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  BarChart2,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { apiService } from '../services/api';
import type { DailySummaryResponse } from '../types/alarm';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<DailySummaryResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async (dateParam?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.getDailySummary(dateParam);
      setData(res);
      setSelectedDate(res.fecha);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el resumen diario');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadSummary();
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Franja pico
  let peakHour = '-';
  let maxCount = 0;
  if (data?.franjas) {
    data.franjas.forEach((item) => {
      if (item.total_alarmas > maxCount) {
        maxCount = item.total_alarmas;
        peakHour = item.hora;
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-4xl max-h-[95vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0D0D0D] text-white flex-shrink-0">
          <div className="h-[3px] bg-[#E31837]" />
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-[#E31837]/20 border border-[#E31837]/30 flex-shrink-0">
                <BarChart2 className="w-4 h-4 text-[#E31837]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold leading-tight">Resumen Diario de Alarmas</h2>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#E31837] text-white flex-shrink-0">
                    Analytics
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Distribución horaria · Requerimiento 4 de la prueba técnica
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de fecha */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#E31837]" />
            <span className="text-slate-500 font-medium">Fecha:</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {data?.fecha} {data?.es_hoy ? '· Hoy' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {data?.fechas_disponibles && data.fechas_disponibles.length > 0 && (
              <select
                value={selectedDate}
                onChange={(e) => loadSummary(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E31837]/30 focus:border-[#E31837] transition"
              >
                <option value="">Hoy (auto)</option>
                {data.fechas_disponibles.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => loadSummary(selectedDate)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#E31837] hover:bg-slate-100 transition cursor-pointer"
              title="Refrescar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-[3px] border-[#E31837] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-slate-500">
                Calculando distribución horaria…
              </span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <div className="space-y-5">
              {/* KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total del día
                  </p>
                  <p className="text-3xl font-black font-mono text-slate-900 mt-1">
                    {data.total_dia}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-[11px] font-semibold text-[#E31837] uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Franja pico
                  </p>
                  <p className="text-xl font-black font-mono text-slate-900 mt-1 leading-snug">
                    {maxCount > 0 ? (
                      <>
                        {peakHour}
                        <span className="text-sm font-semibold text-slate-500 ml-1.5">
                          ({maxCount} alarmas)
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 text-base">Sin alarmas</span>
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Promedio / hora
                  </p>
                  <p className="text-3xl font-black font-mono text-slate-900 mt-1">
                    {(data.total_dia / 24).toFixed(1)}
                    <span className="text-xs font-normal text-slate-400 ml-1">/h</span>
                  </p>
                </div>
              </div>

              {/* Aviso sin datos */}
              {data.total_dia === 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Sin registros para esta fecha ({data.fecha})
                  </p>
                  {data.fechas_disponibles.length > 0 && (
                    <p>
                      💡 Selecciona una fecha del desplegable, por ejemplo{' '}
                      <button
                        onClick={() => loadSummary(data.fechas_disponibles[0])}
                        className="underline font-bold text-[#E31837] cursor-pointer"
                      >
                        {data.fechas_disponibles[0]}
                      </button>
                      .
                    </p>
                  )}
                </div>
              )}

              {/* Gráfica */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#E31837]" />
                  Distribución horaria — 00:00 a 23:00
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.franjas}
                      margin={{ top: 5, right: 10, left: -20, bottom: 22 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis
                        dataKey="hora"
                        tick={{ fontSize: 9, fill: '#94A3B8' }}
                        interval={1}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                      <Tooltip
                        formatter={(val: any) => [`${val} alarmas`, '']}
                        labelFormatter={(label) => `Franja: ${label}`}
                        contentStyle={{
                          backgroundColor: '#0D0D0D',
                          borderRadius: '8px',
                          color: '#FFF',
                          border: 'none',
                          fontSize: '11px',
                          padding: '8px 12px',
                        }}
                        cursor={{ fill: '#F1F5F9' }}
                      />
                      <Bar dataKey="total_alarmas" radius={[3, 3, 0, 0]}>
                        {data.franjas.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.total_alarmas > 0 ? '#E31837' : '#E2E8F0'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grid horario */}
              <div>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Conteo por franja horaria
                </h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
                  {data.franjas.map((item) => (
                    <div
                      key={item.hora}
                      className={`p-1.5 rounded-lg text-center border transition-colors ${
                        item.total_alarmas > 0
                          ? 'bg-red-50 border-red-200'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="text-[9px] text-slate-400 font-mono">{item.hora}</div>
                      <div
                        className={`text-xs font-bold font-mono mt-0.5 ${
                          item.total_alarmas > 0 ? 'text-[#E31837]' : 'text-slate-300'
                        }`}
                      >
                        {item.total_alarmas}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer del modal */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
