import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, AlertCircle, Loader2, Sparkles, Database } from 'lucide-react';
import { apiService } from '../services/api';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setMessage({ type: 'error', text: 'Solo se permiten archivos .csv o .txt delimitados por "|".' });
      return;
    }
    setIsUploading(true);
    setMessage(null);
    try {
      const response = await apiService.uploadCsv(file);
      setMessage({
        type: 'success',
        text: `${response.message} · ${response.total_guardadas} alarmas integradas`,
      });
      onUploadSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al procesar el archivo CSV' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsUploading(true);
    setMessage(null);
    try {
      const response = await apiService.seedDemo();
      setMessage({ type: 'success', text: response.message });
      onUploadSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al inyectar datos demo' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) handleFileProcess(e.dataTransfer.files[0]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Banda de color Hitss en la parte superior */}
      <div className="h-[3px] bg-[#E31837]" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          {/* Descripción */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Database className="w-4 h-4 text-[#E31837] flex-shrink-0" />
              <span className="text-xs font-bold text-[#E31837] uppercase tracking-wider">
                Ingesta de Datos
              </span>
              <span className="text-xs text-slate-400 font-medium">· Formato pipe ( | )</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              Importación de Alarmas de Red
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-lg">
              Sube el archivo CSV de operaciones delimitado por{' '}
              <code className="bg-slate-100 text-slate-700 px-1 rounded font-mono">|</code>.
              El motor clasificará criticidad y calculará duración acumulada automáticamente.
            </p>
          </div>

          {/* Acciones de carga */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 lg:w-64 flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.length) handleFileProcess(e.target.files[0]);
              }}
              accept=".csv,.txt"
              className="hidden"
            />

            {/* Zona de drag & drop */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center justify-center gap-2.5 border-2 border-dashed rounded-xl px-5 py-3.5 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#E31837] bg-red-50 scale-[1.01]'
                  : 'border-slate-300 hover:border-[#E31837] hover:bg-slate-50'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E31837] flex-shrink-0" />
                  <span className="text-sm font-medium text-[#E31837]">Procesando…</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-700">Cargar CSV</p>
                    <p className="text-[11px] text-slate-400">o arrastra aquí el archivo</p>
                  </div>
                </>
              )}
            </div>

            {/* Botón demo */}
            <button
              type="button"
              onClick={handleSeedDemo}
              disabled={isUploading}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition disabled:opacity-50 cursor-pointer"
              title="Inyecta 3 alarmas con fecha de hoy para demostración (WARN + NORMAL)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              Inyectar datos demo
            </button>
          </div>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div
            className={`mt-4 flex items-start gap-2.5 p-3 rounded-lg text-xs font-medium border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <FileCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
