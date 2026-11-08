import React from 'react';
import type { Alarm } from '../types/alarm';
import {
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wifi,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface AlarmTableProps {
  alarms: Alarm[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  isLoading: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const CriticalityBadge: React.FC<{ criticidad: string }> = ({ criticidad }) => {
  switch (criticidad) {
    case 'CRITICO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#E31837] text-white leading-none whitespace-nowrap shadow-sm shadow-red-200/80">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          CRÍTICO
        </span>
      );
    case 'WARN':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 leading-none whitespace-nowrap shadow-sm shadow-amber-100">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          WARN
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 leading-none whitespace-nowrap">
          <CheckCircle className="w-3 h-3 flex-shrink-0" />
          Normal
        </span>
      );
  }
};

const TechBadge: React.FC<{ value: number }> = ({ value }) => {
  if (value < 0) {
    return (
      <span className="inline-block text-[11px] font-mono text-slate-300 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
        N/D
      </span>
    );
  }
  if (value === 100) {
    return (
      <span className="inline-block text-[11px] font-mono font-bold text-[#E31837] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
        100%
      </span>
    );
  }
  return (
    <span className="inline-block text-[11px] font-mono text-slate-600 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100">
      {value}%
    </span>
  );
};

const formatFecha = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
};

const getRowClass = (criticidad: string): string => {
  switch (criticidad) {
    case 'CRITICO':
      return 'bg-red-50/50 hover:bg-red-100/60 border-l-2 border-l-[#E31837]';
    case 'WARN':
      return 'bg-amber-50/40 hover:bg-amber-100/60 border-l-2 border-l-amber-400';
    default:
      return 'bg-white hover:bg-slate-50 border-l-2 border-l-transparent';
  }
};

export const AlarmTable: React.FC<AlarmTableProps> = ({
  alarms,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, total);

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col" aria-label="Listado de alarmas">
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-bold text-slate-900">Alarmas registradas</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            <span className="font-semibold text-slate-700">{total.toLocaleString()}</span> resultados
          {total > 0 && (
            <span className="ml-1.5 text-slate-400">
              · mostrando <span className="font-semibold text-slate-700">{startIdx}</span>–<span className="font-semibold text-slate-700">{endIdx}</span>
            </span>
          )}
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold">Filas por página</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none focus:border-[#E31837] focus:ring-2 focus:ring-[#E31837]/20 cursor-pointer"
            aria-label="Cantidad de registros por página"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-auto flex-1 scrollbar-thin" style={{ maxHeight: 'min(58vh, 620px)' }}>
        <table className="w-full border-collapse min-w-[780px]" aria-label="Alarmas">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-900 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
              <th className="py-3 px-3 text-center">ID Alarma</th>
              <th className="py-3 px-3 text-center">Criticidad</th>
              <th className="py-3 px-3 text-left">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  Duración
                </div>
              </th>
              <th className="py-3 px-2 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-slate-400" />
                  2G
                </div>
              </th>
              <th className="py-3 px-2 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-slate-400" />
                  3G
                </div>
              </th>
              <th className="py-3 px-2 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-slate-400" />
                  4G
                </div>
              </th>
              <th className="py-3 px-3 text-left">Fecha creación</th>
              <th className="py-3 px-3 text-left">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Ubicación
                </div>
              </th>
              <th className="py-3 px-3 text-center">Notif.</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-7 h-7 border-[3px] border-[#E31837] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-slate-500">Consultando telemetría…</span>
                  </div>
                </td>
              </tr>
            ) : alarms.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-200" />
                    <p className="font-semibold text-slate-600 text-sm">Sin resultados</p>
                    <p className="text-xs text-slate-400">Ajusta los filtros o carga un archivo CSV.</p>
                  </div>
                </td>
              </tr>
            ) : (
              alarms.map((alarm) => (
                <tr
                  key={alarm.id_alarma}
                  className={`transition-all duration-200 ${getRowClass(alarm.criticidad)}`}
                >
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono text-[11px] font-bold text-slate-700">#{alarm.id_alarma}</span>
                  </td>

                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <CriticalityBadge criticidad={alarm.criticidad} />
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                      {alarm.duracion_formato}
                    </span>
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    <TechBadge value={alarm.tech_2g} />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <TechBadge value={alarm.tech_3g} />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <TechBadge value={alarm.tech_4g} />
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-[11px] text-slate-500">{formatFecha(alarm.fecha_creacion)}</span>
                  </td>

                  <td className="py-2.5 px-3 align-middle">
                    <div className="text-[11px] font-semibold text-slate-800 leading-tight truncate max-w-[150px]">
                      {alarm.municipio}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{alarm.departamento}</div>
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-1 rounded-md ${
                        alarm.notificada === 'N'
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {alarm.notificada}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span>Página</span>
          <span className="font-bold text-slate-800">{currentPage}</span>
          <span>de</span>
          <span className="font-bold text-slate-800">{totalPages}</span>
        </div>

        <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            aria-label="Primera página"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 select-none">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  disabled={isLoading}
                  className={`min-w-[30px] h-7 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                    currentPage === p
                      ? 'bg-[#E31837] text-white border-[#E31837] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <span className="sm:hidden px-2 font-semibold text-slate-700">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            aria-label="Última página"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500">
          <span>Ir a:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            key={currentPage}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = Number((e.target as HTMLInputElement).value);
                if (val >= 1 && val <= totalPages) onPageChange(val);
              }
            }}
            className="w-12 border border-slate-200 rounded-lg px-1.5 py-1 text-center text-[11px] focus:outline-none focus:ring-2 focus:ring-[#E31837]/20 focus:border-[#E31837] bg-white"
          />
        </div>
      </div>
    </section>
  );
};
