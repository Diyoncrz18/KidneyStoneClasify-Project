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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

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

  // Auto hide notification setelah 5 detik
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleDeleteScan = async () => {
    if (!scan || !BASE_URL) return;

    try {
      setIsDeleting(true);
      
      const res = await fetch(`${BASE_URL}/api/scans/${scanId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Try to parse response as JSON, handle non-JSON responses gracefully
      let data: any = {};
      let errorMessage = "";
      
      try {
        // Try to parse as JSON first
        const responseText = await res.text();
        
        // Check if response looks like JSON
        const trimmedText = responseText.trim();
        if (trimmedText.startsWith('{') || trimmedText.startsWith('[')) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            // If JSON parsing fails, it's not valid JSON
            if (!res.ok) {
              errorMessage = `Server error: ${res.status} ${res.statusText}`;
            } else {
              // If status is OK but not valid JSON, assume success
              data = { success: true };
            }
          }
        } else {
          // Response is not JSON (likely HTML error page)
          if (!res.ok) {
            // Handle specific HTTP status codes
            if (res.status === 405) {
              errorMessage = "Method DELETE tidak didukung oleh server. Pastikan endpoint DELETE sudah tersedia di backend.";
            } else if (res.status === 404) {
              errorMessage = "Endpoint tidak ditemukan. Pastikan URL endpoint benar.";
            } else if (res.status === 500) {
              errorMessage = "Terjadi kesalahan di server. Silakan coba lagi nanti.";
            } else {
              errorMessage = `Server error: ${res.status} ${res.statusText}`;
            }
          } else {
            // If status is OK but not JSON, assume success
            data = { success: true };
          }
        }
      } catch (readError) {
        // If we can't read the response at all
        if (!res.ok) {
          if (res.status === 405) {
            errorMessage = "Method DELETE tidak didukung oleh server. Pastikan endpoint DELETE sudah tersedia di backend.";
          } else {
            errorMessage = `Server error: ${res.status} ${res.statusText}`;
          }
        } else {
          // If status is OK, assume success
          data = { success: true };
        }
      }

      if (!res.ok || errorMessage) {
        setNotificationMessage(
          errorMessage ||
          data?.error || 
          data?.message || 
          `Gagal menghapus scan. Status: ${res.status}`
        );
        setNotificationType("error");
        setShowNotification(true);
        setShowDeleteModal(false);
        return;
      }

      // Success
      setNotificationMessage("Scan berhasil dihapus. Data dan foto di Cloudinary telah dihapus.");
      setNotificationType("success");
      setShowNotification(true);
      setShowDeleteModal(false);

      // Clear scan data immediately to prevent image loading errors
      setScan(null);

      // Redirect ke patient detail setelah 1.5 detik
      setTimeout(() => {
        router.push(`/patients/${encodeURIComponent(patientId)}`);
      }, 1500);
    } catch (error) {
      // Handle network errors or other exceptions
      let errorMessage = "Terjadi kesalahan saat menghapus scan.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check if it's a 405 error
      if (errorMessage.includes('405') || errorMessage.includes('Method Not Allowed')) {
        errorMessage = "Method DELETE tidak didukung oleh server. Pastikan endpoint DELETE sudah tersedia di backend.";
      }
      
      setNotificationMessage(errorMessage);
      setNotificationType("error");
      setShowNotification(true);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted-dark">Loading scan data...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500">
          <span className="material-symbols-outlined text-4xl">error</span>
        </div>
        <p className="text-red-400 text-lg font-semibold">{error || "Scan not found"}</p>
        <button
          type="button"
          onClick={() => router.push(`/patients/${encodeURIComponent(patientId)}`)}
          className="inline-flex items-center gap-2 rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-text-dark hover:bg-border-dark/40"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Kembali ke Patient Detail
        </button>
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
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className={`inline-flex items-center gap-2 rounded-lg border border-red-500/60 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="material-symbols-outlined text-base">delete</span>
            {isDeleting ? "Menghapus..." : "Delete Scan"}
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
                    // Silently handle error - gambar mungkin sudah dihapus atau tidak tersedia
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                    const parent = img.parentElement;
                    if (parent && !parent.querySelector('.error-message')) {
                      const errorMsg = document.createElement('p');
                      errorMsg.className = 'text-text-muted-dark text-sm error-message';
                      errorMsg.textContent = 'Gambar tidak dapat dimuat';
                      parent.appendChild(errorMsg);
                    }
                  }}
                  loading="lazy"
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
                    // Silently handle error - gambar mungkin sudah dihapus atau tidak tersedia
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                    const parent = img.parentElement;
                    if (parent && !parent.querySelector('.error-message')) {
                      const errorMsg = document.createElement('p');
                      errorMsg.className = 'text-text-muted-dark text-sm error-message';
                      errorMsg.textContent = 'Gambar tidak dapat dimuat';
                      parent.appendChild(errorMsg);
                    }
                  }}
                  loading="lazy"
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
                    // Silently handle error - gambar mungkin sudah dihapus atau tidak tersedia
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                    const parent = img.parentElement;
                    if (parent && !parent.querySelector('.error-message')) {
                      const errorMsg = document.createElement('p');
                      errorMsg.className = 'text-text-muted-dark text-sm error-message';
                      errorMsg.textContent = 'Gambar tidak dapat dimuat';
                      parent.appendChild(errorMsg);
                    }
                  }}
                  loading="lazy"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card-dark border border-border-dark shadow-2xl p-6 mx-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 p-3 rounded-full bg-red-500/10 text-red-500">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-dark">
                  Hapus Scan?
                </h2>
                <p className="text-sm text-text-muted-dark mt-1">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-text-dark">
                Apakah Anda yakin ingin menghapus scan ini? Tindakan ini akan:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-text-muted-dark list-disc list-inside">
                <li>Menghapus data scan dari database</li>
                <li>Menghapus semua foto terkait dari Cloudinary</li>
                <li>Menghapus gambar original, annotated, dan Grad-CAM</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-border-dark px-4 py-2.5 text-sm font-semibold text-text-dark hover:bg-border-dark/40 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteScan}
                disabled={isDeleting}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all ${
                  isDeleting
                    ? "bg-red-500/50 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isDeleting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus Scan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-4 rounded-xl shadow-2xl p-4 min-w-[320px] max-w-md border-2 ${
              notificationType === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            <div
              className={`flex-shrink-0 p-2 rounded-full ${
                notificationType === "success"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {notificationType === "success" ? "check_circle" : "error"}
              </span>
            </div>
            <div className="flex-1">
              <p
                className={`font-semibold text-sm ${
                  notificationType === "success"
                    ? "text-green-800 dark:text-green-300"
                    : "text-red-800 dark:text-red-300"
                }`}
              >
                {notificationMessage}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className={`flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors ${
                notificationType === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
