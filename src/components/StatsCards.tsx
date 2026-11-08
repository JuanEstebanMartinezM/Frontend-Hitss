import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import type { FilterStatus } from '../types/alarm';

interface StatsCardsProps {
  total: number;
  totalCritico: number;
  totalWarn: number;
  totalNormal: number;
  activeFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
}

interface CardConfig {
  id: FilterStatus;
  label: string;
  sublabel: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  activeBorder: string;
  activeShadow: string;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  numberColor: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  total,
  totalCritico,
  totalWarn,
  totalNormal,
  activeFilter,
  onSelectFilter,
}) => {
  const cards: CardConfig[] = [
    {
      id: 'ALL',
      label: 'Total Registros',
      sublabel: 'Dataset completo',
      count: total,
      icon: Layers,
      activeBorder: 'border-slate-700 ring-2 ring-slate-700',
      activeShadow: 'shadow-lg shadow-slate-200',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      accentColor: 'bg-slate-700',
      numberColor: 'text-slate-900',
    },
    {
      id: 'CRITICO',
      label: 'Críticas',
      sublabel: '> 24h activas',
      count: totalCritico,
      icon: AlertCircle,
      activeBorder: 'border-[#E31837] ring-2 ring-[#E31837]',
      activeShadow: 'shadow-lg shadow-red-100',
      iconBg: 'bg-red-50',
      iconColor: 'text-[#E31837]',
      accentColor: 'bg-[#E31837]',
      numberColor: 'text-[#E31837]',
    },
    {
      id: 'WARN',
      label: 'Advertencia',
      sublabel: '1h – 24h activas',
      count: totalWarn,
      icon: AlertTriangle,
      activeBorder: 'border-amber-500 ring-2 ring-amber-500',
      activeShadow: 'shadow-lg shadow-amber-100',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accentColor: 'bg-amber-500',
      numberColor: 'text-amber-700',
    },
    {
      id: 'NORMAL',
      label: 'Normales',
      sublabel: 'En umbral regular',
      count: totalNormal,
      icon: CheckCircle2,
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500',
      activeShadow: 'shadow-lg shadow-emerald-100',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accentColor: 'bg-emerald-500',
      numberColor: 'text-emerald-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter(card.id)}
            className={`relative bg-white rounded-xl border p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer overflow-hidden group ${
              isActive
                ? `${card.activeBorder} ${card.activeShadow}`
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {/* Barra accent superior */}
            <div
              className={`absolute top-0 left-0 right-0 h-[3px] ${card.accentColor} transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
              }`}
            />

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {card.label}
                </p>
                <p
                  className={`text-3xl font-black mt-1 font-mono leading-none tabular-nums ${card.numberColor}`}
                >
                  {card.count.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 mt-1.5 truncate">{card.sublabel}</p>
              </div>

              <div className={`p-2.5 rounded-xl flex-shrink-0 ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>

            {/* Indicador de filtro activo */}
            {isActive && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${card.accentColor}`} />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Filtro activo
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
