export interface Metric {
  id: number;
  hostname: string;
  cpu_load: number;
  memory_used: number;
  memory_total: number;
  disk_used: number;
  disk_total: number;
  net_rx: number;
  net_tx: number;
  timestamp: string;
}

export interface ApiResponse {
  data: Metric;
}