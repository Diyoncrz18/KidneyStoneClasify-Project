"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface ScanDetail {
  id: string;
  patientId: string;
  prediction: string;
  confidence: number;
  timestamp: string;
  modelVersion: string;
  notes: string;
  originalImageUrl: string;
  gradcamImageUrl: string;
  annotatedImageUrl: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASEURL_BE;

export default function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string; scanId: string }> | { id: string; scanId: string };
}) {
  const router = useRouter();
  
  // Unwrap params if it's a Promise (Next.js 15+)
  const resolvedParams = typeof params.then === 'function' ? use(params) : params;
  // Decode IDs in case they were URL encoded
  const patientId = resolvedParams.id ? decodeURIComponent(resolvedParams.id) : resolvedParams.id;
  const scanId = resolvedParams.scanId ? decodeURIComponent(resolvedParams.scanId) : resolvedParams.scanId;
  
  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScanData = async () => {
      if (!BASE_URL) {
        setError("Base URL not configured");
        setLoading(false);
        return;
      }

      if (!scanId) {
        setError("Scan ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("[DEBUG] Loading scan with ID:", scanId);
        const res = await fetch(`${BASE_URL}/api/scans/${scanId}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
          console.error("[DEBUG] Error response:", errorData);
          throw new Error(errorData.error || "Failed to load scan data");
        }

        const data = await res.json();
        console.log("[DEBUG] Scan data loaded:", data);
        
        if (!data) {
          throw new Error("Scan data not found in response");
        }

        // Format date untuk timestamp
        const formatDate = (iso?: string | null) => {
          if (!iso) return "-";
          try {
            const date = new Date(iso);
            return date.toLocaleString("id-ID", {
              timeZone: "Asia/Makassar",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
          } catch {
            return String(iso);
          }
        };

        // Helper untuk membuat URL lengkap
        const makeUrl = (path?: string | null) => {
          if (!path) return "";
          if (/^https?:\/\//i.test(path)) return path;
          if (/^data:/.test(path)) return path;
          return `${BASE_URL}/${path.replace(/^\/+/, "")}`;
        };

        // Pastikan confidence dalam format 0-100 untuk ditampilkan
        // Jika confidence sudah > 1, berarti sudah dalam format 0-100, jika tidak kalikan dengan 100
        const confidenceValue = data.confidence || 0;
        const confidencePercent = confidenceValue > 1 
          ? Math.round(confidenceValue) 
          : Math.round(confidenceValue * 100);

        setScan({
          id: data.id,
          patientId: data.patientId || patientId,
          prediction: data.prediction || "Unknown",
          confidence: confidencePercent,
          timestamp: formatDate(data.scanDate),
          modelVersion: data.modelVersion || "YOLOv8 KidneyStone v1",
          notes: data.notes || "Tidak ada catatan.",
          originalImageUrl: makeUrl(data.imagePath) || "",
          gradcamImageUrl: makeUrl(data.gradCamPath) || "",
          annotatedImageUrl: makeUrl(data.annotatedImagePath) || "",
        });
      } catch (err) {
        console.error("Error loading scan data:", err);
        setError(err instanceof Error ? err.message : "Failed to load scan data");
      } finally {
        setLoading(false);
      }
    };

    loadScanData();
  }, [scanId, patientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted-dark">Loading scan data...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-400">{error || "Scan not found"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Scan Detail</h1>
          <p className="text-sm text-text-muted-dark">
            Analisis lengkap untuk satu hasil scan CT pasien.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-text-dark hover:bg-border-dark/40"
          >
            <span className="material-symbols-outlined text-base">
              picture_as_pdf
            </span>
            Download PDF Report
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/60 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Delete Scan
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-card-dark border border-border-dark p-4 shadow-md flex flex-col gap-3">
            <p className="text-sm font-semibold text-text-dark">
              Original CT Scan Image
            </p>
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#111621] flex items-center justify-center">
              {scan.originalImageUrl ? (
                <img
                  src={scan.originalImageUrl}
                  alt="Original CT Scan"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error("[DEBUG] Error loading original image:", scan.originalImageUrl);
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<p class="text-text-muted-dark text-sm">Gambar tidak dapat dimuat</p>';
                    }
                  }}
                />
              ) : (
                <p className="text-text-muted-dark text-sm">Gambar tidak tersedia</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-card-dark border border-border-dark p-4 shadow-md flex flex-col gap-3">
            <p className="text-sm font-semibold text-text-dark">
              Grad-CAM Image
            </p>
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#111621] flex items-center justify-center">
              {scan.gradcamImageUrl ? (
                <img
                  src={scan.gradcamImageUrl}
                  alt="Grad-CAM"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error("[DEBUG] Error loading Grad-CAM image:", scan.gradcamImageUrl);
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<p class="text-text-muted-dark text-sm">Gambar tidak dapat dimuat</p>';
                    }
                  }}
                />
              ) : (
                <p className="text-text-muted-dark text-sm">Gambar tidak tersedia</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-card-dark border border-border-dark p-4 shadow-md flex flex-col gap-3 md:col-span-2">
            <p className="text-sm font-semibold text-text-dark">
              Annotated Detection Image
            </p>
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#111621] flex items-center justify-center">
              {scan.annotatedImageUrl ? (
                <img
                  src={scan.annotatedImageUrl}
                  alt="Annotated Detection"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error("[DEBUG] Error loading annotated image:", scan.annotatedImageUrl);
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<p class="text-text-muted-dark text-sm">Gambar tidak dapat dimuat</p>';
                    }
                  }}
                />
              ) : (
                <p className="text-text-muted-dark text-sm">Gambar tidak tersedia</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card-dark border border-border-dark p-6 shadow-md flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text-dark">
            Scan Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted-dark">Prediction</span>
              <span className="text-text-dark font-medium text-right">
                {scan.prediction}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted-dark">Confidence</span>
              <span className="text-text-dark font-medium">
                {scan.confidence}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted-dark">Timestamp</span>
              <span className="text-text-dark font-medium text-right">
                {scan.timestamp}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted-dark">Model Version</span>
              <span className="text-text-dark font-medium">
                {scan.modelVersion}
              </span>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <span className="text-text-muted-dark">Notes</span>
            <p className="text-text-dark leading-relaxed text-sm">
              {scan.notes}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/patients/${scan.patientId}`)}
            className="mt-auto inline-flex items-center gap-2 rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-text-dark hover:bg-border-dark/40"
          >
            <span className="material-symbols-outlined text-base">
              arrow_back
            </span>
            Back to Patient Detail
          </button>
        </div>
      </div>
    </div>
  );
}
