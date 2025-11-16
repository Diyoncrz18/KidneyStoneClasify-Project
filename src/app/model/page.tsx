// src/app/model/page.tsx
"use client";

import {
  Chart,
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { TooltipItem } from "chart.js";
import { useEffect, useRef, useMemo } from "react";

Chart.register(
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function ModelOverviewPage() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Generate last 6 months labels
  const getLast6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString("en-US", { month: "short" }));
    }
    return months;
  };

  // Mock data for metrics (you can replace this with API call later)
  // Using useMemo to ensure data doesn't change on every render
  const metricsData = useMemo(() => {
    const months = getLast6Months();
    // Fixed values for consistency (you can replace with API data)
    return {
      labels: months,
      accuracy: [92.5, 94.2, 96.8, 97.1, 98.5, 99.19], // 85-100%
      precision: [88.3, 90.1, 91.5, 93.2, 94.8, 96.2], // 80-98%
      recall: [89.7, 91.2, 92.8, 94.1, 95.5, 97.3], // 82-98%
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart if any
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Create new chart
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: metricsData.labels,
        datasets: [
          {
            label: "Accuracy",
            data: metricsData.accuracy,
            borderColor: "#2463eb", // primary blue
            backgroundColor: "rgba(36, 99, 235, 0.1)",
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#2463eb",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
          },
          {
            label: "Precision",
            data: metricsData.precision,
            borderColor: "#0bda62", // green
            backgroundColor: "rgba(11, 218, 98, 0.1)",
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#0bda62",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
          },
          {
            label: "Recall",
            data: metricsData.recall,
            borderColor: "#f87171", // red
            backgroundColor: "rgba(248, 113, 113, 0.1)",
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#f87171",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index" as const,
          intersect: false,
        },
        plugins: {
          legend: {
            display: false, // We have custom legend in the header
          },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<"line">) => {
                return `${context.dataset.label}: ${Number(context.parsed.y).toFixed(2)}%`;
              },
            },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            padding: 12,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#94a3b8", // text-text-secondary
              font: {
                size: 12,
                weight: "bold" as const,
              },
            },
          },
          y: {
            beginAtZero: false,
            min: 70,
            max: 100,
            grid: {
              color: "rgba(148, 163, 184, 0.1)",
            },
            ticks: {
              color: "#94a3b8",
              callback: (value: number | string) => `${value}%`,
              font: {
                size: 11,
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
  }, [metricsData]);

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="flex flex-col gap-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <p className="text-text-secondary text-sm font-medium leading-normal">Current Model</p>
            <p className="text-text-main tracking-light text-2xl font-bold leading-tight">YOLO V8</p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <p className="text-text-secondary text-sm font-medium leading-normal">Accuracy</p>
            <p className="text-text-main tracking-light text-2xl font-bold leading-tight">99.19%</p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <p className="text-text-secondary text-sm font-medium leading-normal">Last Retrain</p>
            <p className="text-text-main tracking-light text-2xl font-bold leading-tight">2025-11-07</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="flex flex-col gap-6 rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-text-main text-lg font-bold leading-normal">Model Performance</h3>
              <p className="text-text-secondary text-sm font-normal leading-normal">Metrics over the last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-text-secondary">Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#0bda62]"></div>
                <span className="text-text-secondary">Precision</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#f87171]"></div>
                <span className="text-text-secondary">Recall</span>
              </div>
            </div>
          </div>
          <div className="flex min-h-[300px] flex-1 flex-col gap-4 py-4">
            <div className="relative h-full w-full">
              <canvas ref={chartRef} className="h-full w-full"></canvas>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex pt-4">
          <button className="flex h-12 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold leading-normal tracking-[0.015em] text-white shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg">
            <span className="truncate">Check for Updates</span>
          </button>
        </div>
      </div>
    </main>
  );
}