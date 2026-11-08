export type Criticidad = 'CRITICO' | 'WARN' | 'NORMAL';
export type FilterStatus = 'ALL' | 'CRITICO' | 'WARN' | 'NORMAL';

export interface Alarm {
  id_alarma: number;
  tech_2g: number;
  tech_3g: number;
  tech_4g: number;
  fecha_creacion: string;
  municipio: string;
  departamento: string;
  notificada: string;
  duracion_segundos: number;
  duracion_formato: string;
  criticidad: Criticidad;
  cumple_condiciones_base: boolean;
}

export interface AlarmListResponse {
  items: Alarm[];
  total: number;
  total_critico: number;
  total_warn: number;
  total_normal: number;
}

export interface HourlySummaryItem {
  hora: string;
  total_alarmas: number;
}

export interface DailySummaryResponse {
  fecha: string;
  total_dia: number;
  franjas: HourlySummaryItem[];
  es_hoy: boolean;
  fechas_disponibles: string[];
}

export interface UploadResponse {
  message: string;
  total_procesadas: number;
  total_guardadas: number;
}

