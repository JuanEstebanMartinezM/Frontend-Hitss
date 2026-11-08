import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { apiService } from './services/api';
import type { Alarm, FilterStatus } from './types/alarm';
import { HitssLogo } from './components/HitssLogo';
import { StatsCards } from './components/StatsCards';
import { FileUpload } from './components/FileUpload';
import { FilterBar } from './components/FilterBar';
import { AlarmTable } from './components/AlarmTable';
import { SummaryModal } from './components/SummaryModal';

export function App() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [total, setTotal] = useState(0);
  const [totalCritico, setTotalCritico] = useState(0);
  const [totalWarn, setTotalWarn] = useState(0);
  const [totalNormal, setTotalNormal] = useState(0);

  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Debounce para búsqueda en tiempo real (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Cargar lista de alarmas desde el backend
  const loadAlarms = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAlarms(currentFilter, debouncedSearch, currentPage, pageSize);
      setAlarms(data.items);
      setTotal(data.total);
      setTotalCritico(data.total_critico);
      setTotalWarn(data.total_warn);
      setTotalNormal(data.total_normal);
      const lastPage = Math.max(1, Math.ceil(data.total / pageSize));
      if (currentPage > lastPage) {
        setCurrentPage(lastPage);
      }
      setBackendStatus('online');
    } catch (error) {
      console.error('Error al cargar alarmas:', error);
      setBackendStatus('offline');
    } finally {
      setIsLoading(false);
    }
  }, [currentFilter, debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);

  const handleFilterChange = (filter: FilterStatus) => {
    setCurrentFilter(filter);
    setCurrentPage(1);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await apiService.downloadExcel(currentFilter, debouncedSearch);
    } catch (err: any) {
      alert(err.message || 'Error al exportar a Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 flex flex-col font-sans">
      {/* ── Header principal ── */}
      <header className="bg-white text-slate-900 sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        {/* Franja roja superior delgada */}
        <div className="h-1 w-full bg-[#E31837]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Logo + título */}
          <div className="flex items-center gap-4 min-w-0">
            <HitssLogo variant="dark" className="h-10 flex-shrink-0" />
            <div className="hidden lg:block border-l border-slate-200 pl-4">
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                Sistema de Monitoreo de Alarmas
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Operaciones de Red · Criticidad en tiempo real
              </p>
            </div>
          </div>

          {/* Estado API + botón refresh */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                backendStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : backendStatus === 'checking'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-red-50 text-[#E31837] border-red-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  backendStatus === 'online'
                    ? 'bg-emerald-500 animate-pulse'
                    : backendStatus === 'checking'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-[#E31837]'
                }`}
              />
              <span className="hidden sm:inline whitespace-nowrap">
                {backendStatus === 'online'
                  ? 'API Online'
                  : backendStatus === 'checking'
                  ? 'Conectando…'
                  : 'Sin conexión'}
              </span>
            </div>

            <button
              onClick={() => loadAlarms()}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Recargar datos"
              aria-label="Recargar datos"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Contenido principal ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Banner de error de conexión */}
        {backendStatus === 'offline' && (
          <div className="p-4 rounded-xl bg-white border border-red-200 text-red-900 flex items-center justify-between shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-[#E31837] flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Backend FastAPI no encontrado</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifica que el servidor esté en{' '}
                  <code className="bg-slate-100 text-[#E31837] px-1 rounded font-mono">
                    http://localhost:8000
                  </code>
                </p>
              </div>
            </div>
            <button
              onClick={() => loadAlarms()}
              className="px-4 py-1.5 rounded-lg bg-[#E31837] text-white text-xs font-bold hover:bg-[#c0121f] transition cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Ingesta de archivo CSV */}
        <FileUpload onUploadSuccess={loadAlarms} />

        {/* Tarjetas de métricas */}
        <StatsCards
          total={total}
          totalCritico={totalCritico}
          totalWarn={totalWarn}
          totalNormal={totalNormal}
          activeFilter={currentFilter}
          onSelectFilter={handleFilterChange}
        />

        {/* Barra de filtros y acciones */}
        <FilterBar
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenSummary={() => setIsSummaryOpen(true)}
          onExportExcel={handleExportExcel}
          isExporting={isExporting}
        />

        {/* Tabla de alarmas */}
        <AlarmTable
          alarms={alarms}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          isLoading={isLoading}
        />
      </main>

      {/* Modal resumen del día */}
      <SummaryModal isOpen={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} />

      {/* Footer */}
      <footer className="bg-[#0D0D0D] border-t border-slate-800 py-4 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#E31837] font-bold tracking-wide">GLOBAL HITSS</span>
            <span className="text-slate-700">·</span>
            <span>Prueba Técnica · Desarrollador Full Stack</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Sparkles className="w-3 h-3 text-[#E31837]" />
            <span>Servicio de criticidad programado sin IA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
