import React from 'react';
import { Search, Download, BarChart3, SlidersHorizontal, Loader2 } from 'lucide-react';
import type { FilterStatus } from '../types/alarm';

interface FilterBarProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenSummary: () => void;
  onExportExcel: () => void;
  isExporting: boolean;
}

const FILTER_OPTIONS: { id: FilterStatus; label: string; dotColor: string; activeClass: string }[] = [
  {
    id: 'ALL',
    label: 'Todos',
    dotColor: 'bg-slate-500',
    activeClass: 'bg-slate-900 text-white border-slate-900',
  },
  {
    id: 'CRITICO',
    label: 'Crítico',
    dotColor: 'bg-[#E31837]',
    activeClass: 'bg-[#E31837] text-white border-[#E31837]',
  },
  {
    id: 'WARN',
    label: 'Warn',
    dotColor: 'bg-amber-500',
    activeClass: 'bg-amber-500 text-white border-amber-500',
  },
  {
    id: 'NORMAL',
    label: 'Normal',
    dotColor: 'bg-emerald-500',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
  },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  onOpenSummary,
  onExportExcel,
  isExporting,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Filtros de criticidad */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E31837]" />
            Vista:
          </div>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = currentFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onFilterChange(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? `${opt.activeClass} shadow-sm`
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isActive ? 'bg-white/70' : opt.dotColor
                  }`}
                />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Buscador + acciones */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Buscador */}
          <div className="relative flex-1 sm:flex-none sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar ID, municipio…"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31837]/30 focus:border-[#E31837] transition placeholder:text-slate-400"
            />
          </div>

          {/* Resumen del día */}
          <button
            onClick={onOpenSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer whitespace-nowrap"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#E31837]" />
            Resumen del día
          </button>

          {/* Exportar Excel */}
          <button
            onClick={onExportExcel}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#E31837] text-white border border-[#E31837] hover:bg-[#c0121f] hover:border-[#c0121f] disabled:opacity-60 transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isExporting ? 'Generando…' : 'Exportar Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};
