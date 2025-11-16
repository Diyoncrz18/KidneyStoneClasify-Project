// src/app/dashboard/page.tsx
"use client";

import {
  Chart,
  ArcElement,
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { TooltipItem } from "chart.js";
import { useEffect, useRef, useState } from "react";

Chart.register(
  ArcElement,
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

interface DistributionItem {
  label: string;
  count: number;
  color: string;
}

interface AccuracyPoint {
  date: string;
  averageConfidence: number;
}

interface AnalyticsResponse {
  totalScans: number;
  healthyCount: number;
  ckdCount: number;
  distribution: DistributionItem[];
  accuracyOverTime: AccuracyPoint[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASEURL_BE || "";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse>({
    totalScans: 0,
    healthyCount: 0,
    ckdCount: 0,
    distribution: [],
    accuracyOverTime: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!BASE_URL) {
        setError(
          "Base URL belum dikonfigurasi. Tambahkan NEXT_PUBLIC_BASEURL_BE di .env."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/analytics/classifications`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Gagal memuat data statistik.");
        }
        const payload: AnalyticsResponse = await res.json();
        setAnalytics(payload);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi error tak dikenal"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart if any
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Only create chart if we have data
    if (analytics.accuracyOverTime.length === 0) {
      return;
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: analytics.accuracyOverTime.map((point) => point.date),
        datasets: [
          {
            label: "Avg Confidence (%)",
            data: analytics.accuracyOverTime.map(
              (point) => point.averageConfidence
            ),
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#2563eb",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750,
        },
        interaction: {
          mode: "index" as const,
          intersect: false,
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#94a3b8",
              font: {
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: false,
            min: 0,
            max: 100,
            grid: {
              color: "rgba(148, 163, 184, 0.1)",
            },
            ticks: {
              color: "#94a3b8",
              callback: (value: number | string | undefined) => {
                if (typeof value === "number") {
                  return `${value}%`;
                }
                return value;
              },
              font: {
                size: 11,
              },
            },
          },
        },
        plugins: {
          legend: { 
            display: false 
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context: TooltipItem<"line">) => {
                return `Avg Confidence: ${Number(context.parsed.y).toFixed(2)}%`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [analytics.accuracyOverTime]);

  const totalHealthy = analytics.healthyCount;
  const totalCkd = analytics.ckdCount;
  const total = analytics.totalScans;

  const healthyPercent = total ? Math.round((totalHealthy / total) * 100) : 0;
  const ckdPercent = total ? Math.round((totalCkd / total) * 100) : 0;

  return (
    <div className="flex-1 p-10 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Scan"
          value={total}
          icon="inventory"
          accent="bg-primary/10 text-primary"
        />
        <Card
          title="Healthy Detected"
          value={totalHealthy}
          icon="health_and_safety"
          accent="bg-green-500/10 text-green-500"
        />
        <Card
          title="CKD Detected"
          value={totalCkd}
          icon="warning"
          accent="bg-red-500/10 text-red-500"
        />
        <Card
          title="Avg Confidence"
          value={`${
            analytics.accuracyOverTime.length
              ? analytics.accuracyOverTime[
                  analytics.accuracyOverTime.length - 1
                ].averageConfidence.toFixed(2)
              : 0
          }%`}
          icon="verified"
          accent="bg-yellow-500/10 text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
          <p className="text-text-light dark:text-text-dark text-lg font-semibold">
            Classification Accuracy over Time
          </p>
          <div className="relative min-h-[260px] w-full rounded-xl border border-[#e5e7eb] bg-[#f8fafc] dark:border-[#1e293b] dark:bg-[#0f172a]">
            {loading ? (
              <div className="flex items-center justify-center h-full text-sm text-[#94a3b8]">
                Memuat data...
              </div>
            ) : analytics.accuracyOverTime.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-[#94a3b8]">
                Belum ada data klasifikasi.
              </div>
            ) : (
              <canvas ref={chartRef} className="h-full w-full" />
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
          <p className="text-text-light dark:text-text-dark text-lg font-semibold">
            Healthy vs CKD distribution
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {analytics.distribution.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-[#e5e7eb] p-4 text-center dark:border-[#1e293b]"
                >
                  <span className="text-xs uppercase tracking-widest text-[#94a3b8]">
                    {item.label}
                  </span>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </p>
                  <span className="text-sm text-[#64748b]">
                    {total
                      ? `${Math.round((item.count / total) * 100)}%`
                      : "0%"}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <LegendDot
                label="Healthy"
                color="#22c55e"
                value={healthyPercent}
              />
              <LegendDot label="CKD" color="#f87171" value={ckdPercent} />
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-[#94a3b8]">
          Memuat statistik klasifikasi...
        </p>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

function Card({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string | number;
  icon: string;
  accent: string;
}) {
  return (
    <div className="flex items-start justify-between rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
      <div className="flex flex-col gap-1">
        <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
          {title}
        </p>
        <p className="text-text-light dark:text-text-dark text-3xl font-bold">
          {value}
        </p>
      </div>
      <div className={`p-2 rounded-lg ${accent}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
    </div>
  );
}

function LegendDot({
  label,
  color,
  value,
}: {
  label: string;
  color: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      ></span>
      <span className="text-text-muted-light dark:text-text-muted-dark">
        {label} ({value}%)
      </span>
    </div>
  );
}
