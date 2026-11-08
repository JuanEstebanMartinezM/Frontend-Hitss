import type { AlarmListResponse, DailySummaryResponse, FilterStatus, UploadResponse } from '../types/alarm';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/alarms';

export const apiService = {
  async getAlarms(
    status: FilterStatus = 'ALL',
    search: string = '',
    page: number = 1,
    pageSize: number = 50
  ): Promise<AlarmListResponse> {
    const params = new URLSearchParams({
      status,
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (search.trim()) {
      params.append('search', search.trim());
    }

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener alarmas');
    }
    return response.json();
  },

  async uploadCsv(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al cargar el archivo CSV');
    }
    return response.json();
  },

  async seedDemo(): Promise<UploadResponse> {
    const response = await fetch(`${API_BASE_URL}/seed-demo`, {
      method: 'POST',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al inyectar datos de demostración');
    }
    return response.json();
  },

  async getDailySummary(fecha?: string): Promise<DailySummaryResponse> {
    const params = new URLSearchParams();
    if (fecha) {
      params.append('fecha', fecha);
    }

    const url = params.toString() ? `${API_BASE_URL}/summary?${params.toString()}` : `${API_BASE_URL}/summary`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener el resumen diario');
    }
    return response.json();
  },

  async downloadExcel(status: FilterStatus = 'ALL', search: string = ''): Promise<void> {
    const params = new URLSearchParams({ status });
    if (search.trim()) {
      params.append('search', search.trim());
    }

    const response = await fetch(`${API_BASE_URL}/export?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al generar la exportación a Excel');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `reporte_alarmas_${status.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};
