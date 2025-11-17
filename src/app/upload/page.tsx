// src/app/upload/page.tsx
"use client";

import ChatBot from "@/components/chatBot";
import { useState, useRef, FormEvent, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

interface DetectionResult {
  label: string;
  confidence: number;
  description: string;
  image: string;
  gradcamImage?: string;
  prediction?: string | null;
  modelVersion?: string;
  analyzedAt?: string;
  originalImagePath?: string;
  gradcamPath?: string;
  annotatedImagePath?: string;
}

interface PatientSummary {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  totalScans?: number;
  lastScanDate?: string | null;
}

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [analysisDurationMs, setAnalysisDurationMs] = useState<number | null>(
    null
  );
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [patientTab, setPatientTab] = useState<"existing" | "new">("existing");
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState("Male");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientAddress, setNewPatientAddress] = useState("");
  const [newPatientNotes, setNewPatientNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_BASEURL_BE;

  // Progress bar simulation saat klasifikasi
  useEffect(() => {
    if (isClassifying) {
      setProgress(0);
      // Simulasi progress dari 0-90% selama proses
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90; // Jangan sampai 100% sampai selesai
          return prev + Math.random() * 15; // Increment random untuk natural feel
        });
      }, 200);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // Set ke 100% saat selesai
      if (result) {
        setProgress(100);
        setTimeout(() => setProgress(0), 500);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isClassifying, result]);

  // Auto hide notification setelah 5 detik
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // ✅ Handle pilih file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
      setAnalysisDurationMs(null);
    }
  };

  // ✅ Klik tombol pilih file
  const handleSelectClick = () => fileInputRef.current?.click();

  // ✅ Klasifikasi gambar
  const handleClassify = async () => {
    if (!selectedFile) {
      alert("Pilih gambar terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    setIsClassifying(true);
    setProgress(0);
    setAnalysisDurationMs(null);
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}/detect`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal mendeteksi gambar!");

      const data = await res.json();

      // Pastikan confidence dalam skala 0–100
      const rawConf = typeof data.confidence === "number" ? data.confidence : 0;
      const confidence = Math.round(rawConf * 100);

      // ✅ Label lebih mudah dipahami
      const label =
        confidence < 20
          ? "Aman"
          : confidence < 40
          ? "Ringan"
          : confidence < 60
          ? "Sedang"
          : confidence < 80
          ? "Berat"
          : "Sangat Serius";

      const makeUrl = (p?: string | null) => {
        if (!p) return null;
        // Handle data URI (base64 images)
        if (/^data:/.test(p)) return p;
        // Handle absolute URLs
        if (/^https?:\/\//i.test(p)) return p;
        return `${BASE_URL}/${p.replace(/^\/+/, "")}`;
      };

      // Prioritize Cloudinary URLs from backend response
      // Check for data_uri first (base64 fallback if Cloudinary failed)
      const annotatedDataUri: string | null = data.result_image_data_uri || null;
      const originalDataUri: string | null = data.original_image_data_uri || null;
      
      // Build annotated image source - prioritize Cloudinary URL, fallback to data_uri
      const annotatedRel: string | null =
        data.annotated_image_path ||  // Cloudinary URL (preferred)
        data.result_image_url ||      // Alternative Cloudinary URL
        annotatedDataUri ||            // Base64 data_uri (fallback if Cloudinary failed)
        data.annotated_image ||
        data.detection_image ||
        data.yolo_result_image ||
        (data.result_image ? `static/uploads/${data.result_image}` : null) ||
        (data.image ? `static/uploads/${data.image}` : null);
      
      // Build original image source - prioritize Cloudinary URL, fallback to data_uri
      const originalRel: string | null =
        data.original_image_path ||   // Cloudinary URL (preferred)
        data.original_image_url ||     // Alternative Cloudinary URL
        originalDataUri ||             // Base64 data_uri (fallback if Cloudinary failed)
        (data.original_image ? `static/uploads/${data.original_image}` : null);
      
      const gradcamRel: string | undefined | null =
        data.gradcam_image_data_uri ||  // Prioritize data_uri
        data.gradcam_path ||
        (data.gradcam_image ? `static/uploads/${data.gradcam_image}` : null);

      // Debug logging
      console.log("[DEBUG] Grad-CAM data:", {
        gradcam_path: data.gradcam_path,
        gradcam_image_data_uri: data.gradcam_image_data_uri ? "present" : "missing",
        gradcam_image: data.gradcam_image,
        gradcamRel: gradcamRel,
      });

      const end = performance.now();
      setAnalysisDurationMs(end - start);

      // Build URLs - prioritize absolute URLs (Cloudinary)
      const gradcamImageUrl = gradcamRel 
        ? (gradcamRel.startsWith('data:') || /^https?:\/\//i.test(gradcamRel) 
            ? gradcamRel 
            : makeUrl(gradcamRel) || gradcamRel)
        : undefined;
      
      console.log("[DEBUG] Final gradcamImageUrl:", gradcamImageUrl);

      // Build annotated image URL (YOLO detection result)
      // annotatedRel already includes data_uri as fallback, so just process it
      const annotatedImageUrl = annotatedRel
        ? (annotatedRel.startsWith('data:') || /^https?:\/\//i.test(annotatedRel)
            ? annotatedRel  // Already a data URI or absolute URL
            : makeUrl(annotatedRel) || 
              `${BASE_URL}/${annotatedRel.replace(/^\/+/, "")}`)
        : annotatedDataUri || null;  // Final fallback to data_uri if nothing else works

      console.log("[DEBUG] Annotated image data:", {
        allDataKeys: Object.keys(data),
        annotated_image_path: data.annotated_image_path,
        result_image_data_uri: data.result_image_data_uri ? "present" : "missing",
        original_image_data_uri: data.original_image_data_uri ? "present" : "missing",
        cloudinary_failed: data.cloudinary_failed,
        annotated_image: data.annotated_image,
        detection_image: data.detection_image,
        yolo_result_image: data.yolo_result_image,
        result_image: data.result_image,
        image: data.image,
        annotatedRel: annotatedRel,
        annotatedImageUrl: annotatedImageUrl,
        BASE_URL: BASE_URL,
      });

      // Build original image URL with data_uri fallback
      const originalImageUrl = originalDataUri || 
        (originalRel ? (originalRel.startsWith('data:') || /^https?:\/\//i.test(originalRel)
          ? originalRel
          : makeUrl(originalRel) || `${BASE_URL}/${originalRel.replace(/^\/+/, "")}`)
        : undefined);

      // Final image URL - prioritize Cloudinary, then data_uri
      const finalAnnotatedImageUrl = annotatedImageUrl || annotatedDataUri || "";
      const finalOriginalImageUrl = originalImageUrl || originalDataUri || undefined;
      
      console.log("[DEBUG] Final image URLs:", {
        annotatedImageUrl: annotatedImageUrl ? annotatedImageUrl.substring(0, 100) + "..." : "missing",
        annotatedDataUri: annotatedDataUri ? "present (" + annotatedDataUri.length + " chars)" : "missing",
        finalAnnotatedImageUrl: finalAnnotatedImageUrl ? "present" : "missing",
        originalImageUrl: originalImageUrl ? originalImageUrl.substring(0, 100) + "..." : "missing",
        originalDataUri: originalDataUri ? "present (" + originalDataUri.length + " chars)" : "missing",
      });

      // Ensure description is always present
      const description = data.description || 
        "Deskripsi tidak tersedia. Analisis visual menunjukkan deteksi batu ginjal menggunakan model YOLO.";
      
      console.log("[DEBUG] Description from backend:", {
        description: description ? description.substring(0, 100) + "..." : "missing",
        descriptionLength: description ? description.length : 0,
        hasDescription: !!description,
      });

      const resultData = {
        confidence,
        label,
        description: description,  // Always ensure description is present
        image: finalAnnotatedImageUrl,  // Use Cloudinary URL or data_uri fallback
        gradcamImage: gradcamImageUrl,
        prediction: data.prediction ?? null,
        modelVersion: data.model_version,
        analyzedAt: data.analyzed_at,
        originalImagePath: finalOriginalImageUrl,
        gradcamPath: gradcamRel ? makeUrl(gradcamRel) || gradcamRel : undefined,
        annotatedImagePath: finalAnnotatedImageUrl || undefined,  // Same as image
      };
      
      console.log("[DEBUG] Setting result:", {
        image: resultData.image ? resultData.image.substring(0, 100) + "..." : "empty",
        gradcamImage: resultData.gradcamImage ? "present" : "missing",
        annotatedImagePath: resultData.annotatedImagePath ? resultData.annotatedImagePath.substring(0, 100) + "..." : "missing",
        description: resultData.description ? resultData.description.substring(0, 100) + "..." : "missing",
        descriptionLength: resultData.description ? resultData.description.length : 0,
      });
      setProgress(100); // Set ke 100% sebelum selesai
      setTimeout(() => {
        setResult(resultData);
        setIsClassifying(false);
        setProgress(0);
      }, 300);
    } catch (err) {
      setIsClassifying(false);
      setProgress(0);
      alert((err as Error).message);
    }
  };

  // ✅ Hapus gambar
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setAnalysisDurationMs(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadPatients = async (search: string) => {
    if (!BASE_URL) return;
    try {
      setPatientsLoading(true);
      const params = search ? `?q=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${BASE_URL}/api/patients${params}`);
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Gagal memuat daftar pasien.");
        return;
      }
      setPatients(data as PatientSummary[]);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memuat pasien.");
    } finally {
      setPatientsLoading(false);
    }
  };

  const openSaveModal = () => {
    if (!result) return;
    setPatientTab("existing");
    setShowSaveModal(true);
    loadPatients("");
  };

  const closeSaveModal = () => {
    setShowSaveModal(false);
    setPatientSearch("");
    setPatients([]);
    setNewPatientName("");
    setNewPatientAge("");
    setNewPatientGender("Male");
    setNewPatientPhone("");
    setNewPatientAddress("");
    setNewPatientNotes("");
  };

  const selectPatient = (patient: PatientSummary) => {
    saveScanForPatient(patient.id);
  };

  const createPatient = (e: FormEvent) => {
    handleCreatePatientAndSave(e);
  };

  const saveScanForPatient = async (patientId: string) => {
    if (!result || !BASE_URL) return;
    try {
      setSaving(true);

      // Pastikan confidence dalam format 0-1 untuk disimpan di database
      const confidenceValue = typeof result.confidence === "number" 
        ? (result.confidence > 1 ? result.confidence / 100 : result.confidence)
        : 0;

      const payload = {
        patientId,
        prediction: result.prediction || result.label,
        confidence: confidenceValue,
        imagePath: result.originalImagePath || "",
        gradCamPath: result.gradcamPath || "",
        annotatedImagePath: result.annotatedImagePath || "",
        modelVersion: result.modelVersion || "YOLOv8 KidneyStone v1",
        scanDate: result.analyzedAt || new Date().toISOString(),
        notes: result.description || "",
        pdfReportPath: "",
      };

      const res = await fetch(`${BASE_URL}/api/scans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotificationMessage(data?.error || "Gagal menyimpan hasil scan.");
        setNotificationType("error");
        setShowNotification(true);
        return;
      }

      closeSaveModal();
      setNotificationMessage("Scan berhasil disimpan ke pasien.");
      setNotificationType("success");
      setShowNotification(true);
      
      // Redirect setelah 1.5 detik
      setTimeout(() => {
        router.push(`/patients/${patientId}`);
      }, 1500);
    } catch (error) {
      console.error(error);
      setNotificationMessage("Terjadi kesalahan saat menyimpan scan.");
      setNotificationType("error");
      setShowNotification(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePatientAndSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!result || !BASE_URL) return;

    if (!newPatientName || !newPatientAge) {
      alert("Name dan Age wajib diisi.");
      return;
    }

    const ageNumber = Number(newPatientAge);
    if (Number.isNaN(ageNumber)) {
      alert("Age harus berupa angka.");
      return;
    }

    try {
      setSaving(true);

      const patientRes = await fetch(`${BASE_URL}/api/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPatientName,
          age: ageNumber,
          gender: newPatientGender,
          phone: newPatientPhone,
          address: newPatientAddress,
          notes: newPatientNotes,
        }),
      });
      const patientData = await patientRes.json();
      if (!patientRes.ok) {
        setNotificationMessage(patientData?.error || "Gagal membuat pasien baru.");
        setNotificationType("error");
        setShowNotification(true);
        return;
      }

      const patientId: string = patientData.id;

      // Pastikan confidence dalam format 0-1 untuk disimpan di database
      const confidenceValue = typeof result.confidence === "number" 
        ? (result.confidence > 1 ? result.confidence / 100 : result.confidence)
        : 0;

      const payload = {
        patientId,
        prediction: result.prediction || result.label,
        confidence: confidenceValue,
        imagePath: result.originalImagePath || "",
        gradCamPath: result.gradcamPath || "",
        annotatedImagePath: result.annotatedImagePath || "",
        modelVersion: result.modelVersion || "YOLOv8 KidneyStone v1",
        scanDate: result.analyzedAt || new Date().toISOString(),
        notes: result.description || "",
        pdfReportPath: "",
      };

      const scanRes = await fetch(`${BASE_URL}/api/scans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const scanData = await scanRes.json();
      if (!scanRes.ok) {
        setNotificationMessage(scanData?.error || "Gagal menyimpan hasil scan.");
        setNotificationType("error");
        setShowNotification(true);
        return;
      }

      closeSaveModal();
      setNotificationMessage("Pasien baru dan hasil scan berhasil disimpan.");
      setNotificationType("success");
      setShowNotification(true);
      
      // Redirect setelah 1.5 detik
      setTimeout(() => {
        router.push(`/patients/${patientId}`);
      }, 1500);
    } catch (error) {
      console.error(error);
      setNotificationMessage("Terjadi kesalahan saat menyimpan pasien dan scan.");
      setNotificationType("error");
      setShowNotification(true);
    } finally {
      setSaving(false);
    }
  };

  // Calculate file size for display
  const getFileSize = (file: File | null) => {
    if (!file) return "0 KB";
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB < 1) {
      return `${(file.size / 1024).toFixed(2)} KB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  };

  // Get file type
  const getFileType = (file: File | null) => {
    if (!file) return "-";
    return file.type || file.name.split(".").pop()?.toUpperCase() || "UNKNOWN";
  };

  return (
    <main className="flex-1 overflow-y-auto p-10">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 mb-8">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-3xl font-bold leading-tight tracking-[-0.033em] text-white">
            Upload Gambar
          </p>
          <p className="text-base font-normal leading-normal text-[#92a4c8]">
            Unggah hasil scan KidneyStone Anda untuk analisis AI yang akurat dan cepat.
          </p>
        </div>
      </div>

      {/* Information Cards - Similar to Dashboard */}
      {selectedFile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="flex items-start justify-between rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
            <div className="flex flex-col gap-1">
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
                Nama File
              </p>
              <p className="text-text-light dark:text-text-dark text-lg font-bold truncate max-w-[200px]">
                {selectedFile.name}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-xl">description</span>
            </div>
          </div>

          <div className="flex items-start justify-between rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
            <div className="flex flex-col gap-1">
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
                Ukuran File
              </p>
              <p className="text-text-light dark:text-text-dark text-3xl font-bold">
                {getFileSize(selectedFile)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <span className="material-symbols-outlined text-xl">storage</span>
            </div>
          </div>

          <div className="flex items-start justify-between rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
            <div className="flex flex-col gap-1">
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
                Tipe File
              </p>
              <p className="text-text-light dark:text-text-dark text-lg font-bold">
                {getFileType(selectedFile)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
              <span className="material-symbols-outlined text-xl">image</span>
            </div>
          </div>

          <div className="flex items-start justify-between rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
            <div className="flex flex-col gap-1">
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
                Status
              </p>
              <p className={`text-lg font-bold ${
                result ? "text-green-500" : isClassifying ? "text-yellow-500" : "text-primary"
              }`}>
                {result ? "Selesai" : isClassifying ? "Memproses..." : "Siap"}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${
              result ? "bg-green-500/10 text-green-500" : 
              isClassifying ? "bg-yellow-500/10 text-yellow-500" : 
              "bg-primary/10 text-primary"
            }`}>
              <span className="material-symbols-outlined text-xl">
                {result ? "check_circle" : isClassifying ? "sync" : "upload"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="flex flex-col gap-6">
          {!previewUrl ? (
            // Upload area - Enhanced Design
            <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-8">
              <div
                onClick={handleSelectClick}
                className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#334366] px-6 py-16 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E293B]/30 transition-all group"
              >
                <div className="flex max-w-[480px] flex-col items-center gap-4">
                  <div className="p-6 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all">
                    <span className="material-symbols-outlined text-6xl text-primary">
                      cloud_upload
                    </span>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-bold text-text-light dark:text-text-dark">
                      Klik atau seret gambar ke sini
                    </p>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                      Format yang didukung: JPG, PNG, DICOM
                    </p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-4">
                      Maksimal ukuran file: 10 MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectClick();
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-3 bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                  >
                    <span className="material-symbols-outlined text-lg">folder_open</span>
                    Pilih File
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.dcm"
                  className="hidden"
                />
              </div>
              
              {/* Upload Instructions */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
                  <div>
                    <p className="text-sm font-semibold text-text-light dark:text-text-dark">Format Gambar</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                      Gunakan gambar dengan kualitas tinggi untuk hasil terbaik
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <span className="material-symbols-outlined text-green-500 text-xl">security</span>
                  <div>
                    <p className="text-sm font-semibold text-text-light dark:text-text-dark">Privasi Terjamin</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                      Data Anda aman dan tidak dibagikan ke pihak ketiga
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <span className="material-symbols-outlined text-purple-500 text-xl">speed</span>
                  <div>
                    <p className="text-sm font-semibold text-text-light dark:text-text-dark">Analisis Cepat</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                      Hasil analisis AI dalam hitungan detik
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Preview image - Enhanced Design
            <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text-light dark:text-text-dark">
                    Pratinjau Gambar
                  </h3>
                  <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">
                    Pastikan gambar sudah sesuai sebelum melakukan analisis
                  </p>
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                  title="Hapus gambar"
                >
                  <span className="material-symbols-outlined text-xl">
                    close
                  </span>
                </button>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-[#111621] flex items-center justify-center border-2 border-gray-200 dark:border-[#334366]">
                <img
                  alt="Uploaded kidney scan"
                  className="h-full w-full object-contain p-2"
                  src={previewUrl}
                  onLoad={() => URL.revokeObjectURL(previewUrl)}
                />

                {/* ✅ Loading overlay saat klasifikasi dengan Progress Bar */}
                {isClassifying && (
                  <div className="absolute inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-6 w-full max-w-md px-6">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-center w-full">
                        <p className="text-white font-semibold text-lg mb-2">
                          Menganalisis gambar...
                        </p>
                        <p className="text-gray-300 text-sm mb-4">
                          Mohon tunggu sebentar
                        </p>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300 ease-out rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          >
                            {progress > 10 && (
                              <span className="text-xs text-white font-semibold">
                                {Math.round(progress)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">
                          {Math.round(progress)}% selesai
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={handleClassify}
                  disabled={isClassifying}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl h-12 px-5 bg-primary text-base font-semibold text-white hover:bg-primary/90 transition-all shadow-md hover:shadow-lg ${
                    isClassifying ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isClassifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menganalisis...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">psychology</span>
                      Analisis Gambar
                    </>
                  )}
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center justify-center gap-2 rounded-xl h-12 px-5 bg-gray-200 dark:bg-gray-700 text-base font-semibold text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                  Hapus
                </button>
              </div>
            </div>
          )}

          {/* Hasil Deteksi YOLO dan Grad-CAM Visualization */}
          {result && !isClassifying && (
            <div className="flex flex-col gap-6">
              {/* Gambar Hasil Deteksi YOLO */}
              {(result.image || result.annotatedImagePath) && (
                <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-xl">image_search</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text-light dark:text-text-dark">
                        Hasil Deteksi YOLO
                      </h3>
                      <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        Gambar dengan anotasi dan bounding box deteksi
                      </p>
                    </div>
                  </div>
                  <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-blue-500 text-lg">info</span>
                      <p className="text-sm text-text-light dark:text-text-dark">
                        Gambar ini menunjukkan hasil deteksi model YOLO dengan bounding box yang menandai lokasi batu ginjal yang terdeteksi.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-[#334366] bg-gray-100 dark:bg-[#111621]">
                    {(result.image || result.annotatedImagePath) ? (
                      <img
                        src={result.image || result.annotatedImagePath || ""}
                        alt="YOLO Detection result"
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          console.error("[DEBUG] Error loading YOLO detection image:", {
                            image: result.image,
                            annotatedImagePath: result.annotatedImagePath,
                            currentSrc: img.currentSrc,
                            error: e,
                          });
                          
                          // Try fallbacks in order:
                          // 1. Try annotatedImagePath if different
                          if (result.annotatedImagePath && result.image !== result.annotatedImagePath && img.src !== result.annotatedImagePath) {
                            console.log("[DEBUG] Trying fallback URL:", result.annotatedImagePath);
                            img.src = result.annotatedImagePath;
                            return;
                          }
                          
                          // 2. Try originalImagePath
                          if (result.originalImagePath && img.src !== result.originalImagePath) {
                            console.log("[DEBUG] Trying original image as fallback:", result.originalImagePath);
                            img.src = result.originalImagePath;
                            return;
                          }
                          
                          // 3. Check if we have data_uri in the original response (need to check data object)
                          // This is a last resort - show error message
                          console.error("[DEBUG] All image sources failed to load");
                          img.style.display = 'none';
                          const existingError = img.parentElement?.querySelector('.image-error-message');
                          if (!existingError) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'image-error-message p-4 text-center text-red-500';
                            errorDiv.textContent = 'Gagal memuat gambar hasil deteksi. Silakan coba lagi.';
                            img.parentElement?.appendChild(errorDiv);
                          }
                        }}
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement;
                          console.log("[DEBUG] YOLO detection image loaded successfully:", {
                            image: result.image,
                            annotatedImagePath: result.annotatedImagePath,
                            src: img.src.substring(0, 100),
                          });
                        }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                          <p className="text-sm">Gambar hasil deteksi tidak tersedia</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Grad-CAM Visualization */}
              {result.gradcamImage ? (
                <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                      <span className="material-symbols-outlined text-xl">auto_awesome</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text-light dark:text-text-dark">
                        Grad-CAM Visualization
                      </h3>
                      <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        Heatmap area penting untuk deteksi
                      </p>
                    </div>
                  </div>
                  <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-blue-500 text-lg">info</span>
                      <p className="text-sm text-text-light dark:text-text-dark">
                        Area yang diwarnai menunjukkan bagian penting yang dipelajari model untuk deteksi batu ginjal.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-[#334366] bg-gray-100 dark:bg-[#111621]">
                    {result.gradcamImage ? (
                      <img
                        src={result.gradcamImage}
                        alt="Grad-CAM visualization"
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          console.error("[DEBUG] Error loading Grad-CAM image:", {
                            gradcamImage: result.gradcamImage,
                            currentSrc: img.currentSrc,
                            error: e,
                          });
                          // Hide broken image
                          img.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log("[DEBUG] Grad-CAM image loaded successfully:", result.gradcamImage);
                        }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                          <p className="text-sm">Grad-CAM visualization tidak tersedia</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6 border border-gray-200 dark:border-[#334366]">
                  <div className="flex items-center gap-3 text-text-muted-light dark:text-text-muted-dark">
                    <span className="material-symbols-outlined text-xl">info</span>
                    <p className="text-sm">
                      Grad-CAM visualization tidak tersedia untuk gambar ini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================== RIGHT COLUMN (Deskripsi + ChatBot) ==================== */}
        {result && !isClassifying && (
          <div className="flex flex-col gap-6 h-full">
            <div className="flex flex-col rounded-xl bg-white dark:bg-slate-800 shadow-md p-6 overflow-y-auto max-h-[121vh]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-xl">analytics</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-light dark:text-text-dark">
                    Hasil Analisis AI
                  </h3>
                  <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                    Detail lengkap hasil deteksi
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Tingkat bahaya - Enhanced */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-[#334366]">
                  <p className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-3">
                    Tingkat Bahaya
                  </p>
                  <div className="flex items-center gap-3">
                    <p
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold ${
                        result.label === "Aman"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : result.label === "Ringan"
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          : result.label === "Sedang"
                          ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                          : result.label === "Berat"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-red-700/10 text-red-600 border border-red-700/20"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        local_hospital
                      </span>
                      {result.label}
                    </p>
                  </div>
                </div>

                {/* Tingkat keyakinan - Enhanced */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark">
                      Tingkat Keyakinan
                    </p>
                    <p className="text-2xl font-bold text-text-light dark:text-text-dark">
                      {result.confidence}%
                    </p>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 mt-3">
                    <div
                      className="h-3 rounded-full bg-primary transition-all duration-500 shadow-sm"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Informasi model - Enhanced */}
                <div className="grid gap-4 rounded-xl border-2 border-gray-200 dark:border-[#334366] bg-gray-50 dark:bg-[#0f172a]/60 p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#334366]">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-text-muted-light dark:text-text-muted-dark font-semibold">
                        Prediksi Model
                      </p>
                      <p className="mt-2 text-base font-bold text-text-light dark:text-text-dark">
                        {result.prediction || "Tidak tersedia"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20">
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      Model
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-3 rounded-lg bg-white dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#334366]">
                      <p className="text-xs uppercase tracking-wide text-text-muted-light dark:text-text-muted-dark font-semibold mb-1">
                        Versi Model
                      </p>
                      <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                        {result.modelVersion || "YOLOv8 KidneyStone"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#334366]">
                      <p className="text-xs uppercase tracking-wide text-text-muted-light dark:text-text-muted-dark font-semibold mb-1">
                        Durasi Analisis
                      </p>
                      <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                        {analysisDurationMs !== null
                          ? `${(analysisDurationMs / 1000).toFixed(2)} detik`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={openSaveModal}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg ${
                      saving
                        ? "bg-primary/60 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      save
                    </span>
                    {saving ? "Menyimpan..." : "Simpan ke Pasien"}
                  </button>
                </div>

                {/* Deskripsi AI - Enhanced */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-[#334366]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-lg">description</span>
                    <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                      Deskripsi AI
                    </p>
                  </div>
                  <div className="mt-2 rounded-lg bg-white dark:bg-[#020617]/40 p-4 text-sm leading-relaxed text-text-light dark:text-text-dark border border-gray-200 dark:border-[#1e293b]">
                    {result.description && result.description.trim() ? (
                      <ReactMarkdown>{result.description}</ReactMarkdown>
                    ) : (
                      <p className="text-text-muted-light dark:text-text-muted-dark italic">
                        Deskripsi tidak tersedia. Analisis visual menunjukkan deteksi batu ginjal menggunakan model YOLO.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ChatBot */}
            <ChatBot data={result.description} />
          </div>
        )}
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-3xl rounded-2xl bg-[#020617] border border-[#1e293b] shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Save Result to Patient
                </h2>
                <p className="text-sm text-[#94a3b8]">
                  Pilih pasien lama atau buat pasien baru untuk menyimpan hasil
                  scan ini.
                </p>
              </div>
              <button
                type="button"
                onClick={closeSaveModal}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-[#9ca3af] hover:bg-[#1f2937]"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            </div>

            <div className="mb-4 flex gap-2 rounded-xl bg-[#020617] p-1 border border-[#1e293b]">
              <button
                type="button"
                onClick={() => setPatientTab("existing")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  patientTab === "existing"
                    ? "bg-primary text-white shadow-sm"
                    : "text-[#cbd5f5] hover:bg-[#0f172a]"
                }`}
              >
                Pilih Pasien Lama
              </button>
              <button
                type="button"
                onClick={() => setPatientTab("new")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  patientTab === "new"
                    ? "bg-primary text-white shadow-sm"
                    : "text-[#cbd5f5] hover:bg-[#0f172a]"
                }`}
              >
                Buat Pasien Baru
              </button>
            </div>

            {patientTab === "existing" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">
                      search
                    </span>
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Cari nama pasien..."
                      className="w-full rounded-lg bg-[#020617] border border-[#1e293b] py-2 pl-9 pr-3 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => loadPatients(patientSearch)}
                    className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                  >
                    Cari
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-3">
                  {patientsLoading && (
                    <p className="text-xs text-[#9ca3af]">
                      Memuat daftar pasien...
                    </p>
                  )}
                  {!patientsLoading &&
                    patients.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-xl border border-[#1e293b] bg-[#020617]/80 p-4"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white">
                            {p.name}
                          </p>
                          <p className="text-xs text-[#94a3b8]">
                            {p.age ? `${p.age} tahun` : "Umur tidak tersedia"}{" "}
                            {p.gender || "-"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectPatient(p)}
                          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                        >
                          Pilih
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {patientTab === "new" && (
              <div className="space-y-4">
                <form onSubmit={createPatient}>
                  <div className="grid gap-3">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-white"
                      >
                        Nama Pasien
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        className="block w-full rounded-lg bg-[#020617] border border-[#1e293b] py-2 pl-3 pr-3 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="age"
                        className="block text-sm font-medium text-white"
                      >
                        Umur Pasien
                      </label>
                      <input
                        type="number"
                        id="age"
                        value={newPatientAge}
                        onChange={(e) => setNewPatientAge(e.target.value)}
                        className="block w-full rounded-lg bg-[#020617] border border-[#1e293b] py-2 pl-3 pr-3 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium text-white"
                      >
                        Jenis Kelamin Pasien
                      </label>
                      <select
                        id="gender"
                        value={newPatientGender}
                        onChange={(e) => setNewPatientGender(e.target.value)}
                        className="block w-full rounded-lg bg-[#020617] border border-[#1e293b] py-2 pl-3 pr-3 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-white"
                      >
                        Nomor Telepon
                      </label>
                      <input
                        type="text"
                        id="phone"
                        value={newPatientPhone}
                        onChange={(e) => setNewPatientPhone(e.target.value)}
                        placeholder="+62 812 3456 7890"
                        className="block w-full rounded-lg bg-[#020617] border border-[#1e293b] py-2 pl-3 pr-3 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-white"
                      >
                        Alamat
                      </label>
                      <textarea
                        id="address"
                        value={newPatientAddress}
                        onChange={(e) => setNewPatientAddress(e.target.value)}
                        placeholder="Jl. Contoh No. 123, Kota"
                        rows={3}
                        className="block w-full rounded-lg bg-[#020617] border border-[#1e293b] py-2 pl-3 pr-3 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                  >
                    Buat Pasien Baru
                  </button>
                </form>
              </div>
            )}
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
    </main>
  );
}
