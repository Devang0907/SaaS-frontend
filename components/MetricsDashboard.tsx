'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Metric, ApiResponse } from '@/types/metrics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const chartRef = useRef<ChartJS | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

  const fetchMetrics = async () => {
    if (!apiKey) {
      setError('API key not found');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/metrics/${process.env.NEXT_PUBLIC_HOSTNAME}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      setMetrics(response.data.data);
    } catch (err: unknown) {
      setError('Failed to fetch metrics');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(); // Initial fetch
    const interval = setInterval(fetchMetrics, 10000); // Fetch every 10 seconds
    return () => {
      clearInterval(interval); // Clean up interval
      if (chartRef.current) {
        chartRef.current.destroy(); // Clean up chart
      }
    };
  }, [apiKey]);

  const chartData = metrics
    ? {
        labels: ['CPU Load (%)', 'Memory Usage (%)', 'Disk Usage (%)', 'Net RX (bytes)', 'Net TX (bytes)'],
        datasets: [
          {
            label: 'Metrics',
            data: [
              metrics.cpu_load,
              (metrics.memory_used / metrics.memory_total) * 100,
              (metrics.disk_used / metrics.disk_total) * 100,
              metrics.net_rx,
              metrics.net_tx,
            ],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Server Metrics Dashboard</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && <p className="text-center text-gray-500">Fetching metrics...</p>}

      {metrics && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Metrics for {metrics.hostname}</h2>
            <Bar
              data={chartData!}
              options={{
                scales: { y: { beginAtZero: true } },
                plugins: { title: { display: true, text: `Metrics for ${metrics.hostname}` } },
              }}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>CPU Load</TableCell>
                <TableCell>{metrics.cpu_load}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Memory Used</TableCell>
                <TableCell>{(metrics.memory_used / 1024 / 1024 / 1024).toFixed(2)} GB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Memory Total</TableCell>
                <TableCell>{(metrics.memory_total / 1024 / 1024 / 1024).toFixed(2)} GB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Memory Usage</TableCell>
                <TableCell>{((metrics.memory_used / metrics.memory_total) * 100).toFixed(2)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Disk Used</TableCell>
                <TableCell>{(metrics.disk_used / 1024 / 1024 / 1024).toFixed(2)} GB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Disk Total</TableCell>
                <TableCell>{(metrics.disk_total / 1024 / 1024 / 1024).toFixed(2)} GB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Disk Usage</TableCell>
                <TableCell>{((metrics.disk_used / metrics.disk_total) * 100).toFixed(2)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Network RX</TableCell>
                <TableCell>{(metrics.net_rx / 1024 / 1024).toFixed(2)} MB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Network TX</TableCell>
                <TableCell>{(metrics.net_tx / 1024 / 1024).toFixed(2)} MB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Last Updated</TableCell>
                <TableCell>{new Date().toUTCString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export default MetricsDashboard;