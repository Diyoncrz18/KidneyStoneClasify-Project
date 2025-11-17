"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface ScanItem {
  id: string;
  scanDate: string;
  prediction: string;
  confidence: number;
  annotatedImagePath?: string;
  imagePath?: string;
}

interface PatientDetail {
  id: string;
  patientId?: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  address?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASEURL_BE;

export default function PatientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter();
  // Unwrap params if it's a Promise (Next.js 15+)
  // Decode patient ID in case it was URL encoded
  const patientId = decodeURIComponent(params.id)
  
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!BASE_URL) {
        setError("Base URL not configured");
        setLoading(false);
        return;
      }

      if (!patientId) {
        setError("Patient ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("[DEBUG] Loading patient with ID:", patientId);
        const res = await fetch(`${BASE_URL}/api/patients/${patientId}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
          console.error("[DEBUG] Error response:", errorData);
          throw new Error(errorData.error || "Failed to load patient data");
        }

        const data = await res.json();
        console.log("[DEBUG] Patient data loaded:", data);
        
        if (!data.patient) {
          throw new Error("Patient data not found in response");
        }

        setPatient({
          id: data.patient.id,
          patientId: data.patient.patientId,
          name: data.patient.name || "-",
          age: data.patient.age || 0,
          gender: data.patient.gender || "-",
          phone: data.patient.phone || "-",
          address: data.patient.address || "-",
        });

        // Helper function to make full URL
        const makeUrl = (path?: string | null) => {
          if (!path) return null;
          if (/^https?:\/\//i.test(path)) return path;
          if (/^data:/.test(path)) return path;
          return `${BASE_URL}/${path.replace(/^\/+/, "")}`;
        };

        // Map scans data
        const mappedScans: ScanItem[] = (data.scans || []).map((scan: any) => {
          // Ensure confidence is in 0-100 format
          let confidenceValue = scan.confidence || 0;
          if (confidenceValue <= 1) {
            confidenceValue = confidenceValue * 100;
          }

          return {
            id: scan.id,
            scanDate: scan.scanDate,
            prediction: scan.prediction || "Unknown",
            confidence: confidenceValue,
            annotatedImagePath: makeUrl(scan.annotatedImagePath) || scan.annotatedImagePath || "",
            imagePath: makeUrl(scan.imagePath) || scan.imagePath || "",
          };
        });

        console.log("[DEBUG] Total scans loaded:", mappedScans.length);
        console.log("[DEBUG] Scans data:", mappedScans);
        setScans(mappedScans);
      } catch (err) {
        console.error("Error loading patient data:", err);
        setError(err instanceof Error ? err.message : "Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted-dark">Loading patient data...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-400">{error || "Patient not found"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Patient Detail</h1>
          <p className="text-sm text-text-muted-dark">
            Informasi lengkap dan riwayat scan pasien.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push("/upload")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-base">
              cloud_upload
            </span>
            Upload New Scan
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-text-dark hover:bg-border-dark/40"
          >
            <span className="material-symbols-outlined text-base">
              download
            </span>
            Download All Reports (ZIP)
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="rounded-2xl bg-card-dark border border-border-dark p-6 shadow-md space-y-3">
          <h2 className="text-lg font-semibold text-text-dark">
            Patient Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted-dark">Name</span>
              <span className="text-text-dark font-medium">{patient.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted-dark">Patient ID</span>
              <span className="text-text-dark font-medium">
                {patient.patientId || patient.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted-dark">Age</span>
              <span className="text-text-dark font-medium">{patient.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted-dark">Gender</span>
              <span className="text-text-dark font-medium">
                {patient.gender}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted-dark">Contact</span>
              <span className="text-text-dark font-medium">
                {patient.phone}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-muted-dark">Address</span>
              <span className="text-text-dark font-medium text-right">
                {patient.address}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card-dark border border-border-dark p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-dark">
              Scan History {scans.length > 0 && `(${scans.length})`}
            </h2>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {scans.length > 0 ? (
              scans.map((scan) => {
                const thumbnailUrl = scan.annotatedImagePath || scan.imagePath || "";
                return (
                <div
                  key={scan.id}
                  className="flex gap-4 rounded-xl bg-background-dark p-3 border border-border-dark/60"
                >
                  {thumbnailUrl && (
                    <img
                      src={thumbnailUrl}
                      alt="Scan thumbnail"
                      className="h-20 w-28 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex flex-1 flex-col justify-between text-sm">
                    <div>
                      <p className="text-text-dark font-semibold">
                        {scan.prediction}
                      </p>
                      <p className="text-text-muted-dark text-xs">
                        {formatDate(scan.scanDate)}
                      </p>
                      <p className="text-text-muted-dark text-xs">
                        Confidence: {Math.round(scan.confidence)}%
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          console.log("[DEBUG] Navigating to scan:", scan.id, "patient:", patient.id);
                          router.push(`/patients/${encodeURIComponent(patient.id)}/scans/${encodeURIComponent(scan.id)}`);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border-dark px-3 py-1 text-xs font-medium text-text-dark hover:bg-border-dark/40"
                      >
                        <span className="material-symbols-outlined text-xs">
                          visibility
                        </span>
                        View Scan Detail
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-border-dark px-3 py-1 text-xs font-medium text-text-dark hover:bg-border-dark/40"
                      >
                        <span className="material-symbols-outlined text-xs">
                          picture_as_pdf
                        </span>
                        Download PDF Report
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
            ) : (
              <p className="text-center text-text-muted-dark text-sm py-8">
                Belum ada riwayat scan untuk pasien ini.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
