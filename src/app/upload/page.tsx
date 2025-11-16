// src/app/upload/page.tsx
"use client";

import ChatBot from "@/components/chatBot";
import { useState, useRef, FormEvent } from "react";
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

  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState("Male");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientAddress, setNewPatientAddress] = useState("");
  const [newPatientNotes, setNewPatientNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_BASEURL_BE;

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

      const annotatedRel: string | null =
        data.annotated_image_path ||
        (data.result_image ? `static/uploads/${data.result_image}` : null);
      const originalRel: string | null =
        data.original_image_path ||
        (data.original_image ? `static/uploads/${data.original_image}` : null);
      const gradcamRel: string | undefined | null =
        data.gradcam_path ||
        data.gradcam_image_data_uri ||
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

      const gradcamImageUrl = gradcamRel ? (makeUrl(gradcamRel) || gradcamRel) : undefined;
      console.log("[DEBUG] Final gradcamImageUrl:", gradcamImageUrl);

      const resultData = {
        confidence,
        label,
        description: data.description,
        image: makeUrl(annotatedRel) || "",
        gradcamImage: gradcamImageUrl,
        prediction: data.prediction ?? null,
        modelVersion: data.model_version,
        analyzedAt: data.analyzed_at,
        originalImagePath: makeUrl(originalRel) || originalRel || undefined,
        gradcamPath: gradcamRel ? makeUrl(gradcamRel) || gradcamRel : undefined,
        annotatedImagePath: annotatedRel
          ? /^https?:\/\//i.test(annotatedRel)
            ? annotatedRel
            : `${BASE_URL}/${annotatedRel}`
          : undefined,
      };
      
      console.log("[DEBUG] Setting result with gradcamImage:", resultData.gradcamImage);
      setResult(resultData);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsClassifying(false);
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
        alert(data?.error || "Gagal menyimpan hasil scan.");
        return;
      }

      closeSaveModal();
      alert("Scan berhasil disimpan ke pasien.");
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan scan.");
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
        alert(patientData?.error || "Gagal membuat pasien baru.");
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
        alert(scanData?.error || "Gagal menyimpan hasil scan.");
        return;
      }

      closeSaveModal();
      alert("Pasien baru dan hasil scan berhasil disimpan.");
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan pasien dan scan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-10">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-3xl font-bold leading-tight tracking-[-0.033em] text-white">
            Upload Gambar
          </p>
          <p className="text-base font-normal leading-normal text-[#92a4c8]">
            Unggah hasil scan KidneyStone Anda untuk analisis AI.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="flex flex-col gap-6">
          {!previewUrl ? (
            // Upload area
            <div
              onClick={handleSelectClick}
              className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#334366] px-6 py-14 cursor-pointer hover:bg-[#1E293B]/30 transition-all"
            >
              <div className="flex max-w-[480px] flex-col items-center gap-2">
                <span className="material-symbols-outlined text-5xl text-primary">
                  cloud_upload
                </span>
                <p className="text-center text-lg font-bold text-white">
                  Klik atau seret gambar ke sini
                </p>
                <p className="text-sm text-[#92a4c8]">
                  Format yang didukung: JPG, PNG, DICOM
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.dcm"
                className="hidden"
              />
            </div>
          ) : (
            // Preview image
            <div className="rounded-xl bg-[#1E293B]/60 p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">
                  Pratinjau Gambar
                </h3>
                <button
                  onClick={handleRemoveImage}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40"
                >
                  <span className="material-symbols-outlined text-base">
                    close
                  </span>
                </button>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#111621] flex items-center justify-center">
                <img
                  alt="Uploaded kidney scan"
                  className="h-full w-full object-contain"
                  src={previewUrl}
                  onLoad={() => URL.revokeObjectURL(previewUrl)}
                />

                {/* ✅ Loading overlay saat klasifikasi */}
                {isClassifying && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-white font-medium">
                        Menganalisis gambar...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex w-full">
                <button
                  onClick={handleClassify}
                  disabled={isClassifying}
                  className={`flex w-full items-center justify-center rounded-xl h-12 px-5 bg-primary text-base font-bold text-white hover:bg-primary/90 transition-all ${
                    isClassifying ? "opacity-70" : ""
                  }`}
                >
                  {isClassifying ? "Menganalisis..." : "Analisis Gambar"}
                </button>
              </div>
            </div>
          )}

          {/* Hasil Gambar Deteksi - Muncul di bawah pratinjau */}
          {result && !isClassifying && (
            <div className="flex flex-col gap-6">
              <div className="rounded-xl bg-[#1E293B]/60 p-6 shadow-md">
                <h3 className="mb-4 text-lg font-bold text-white">
                  Gambar Hasil Deteksi
                </h3>
                <img
                  src={result.image}
                  alt="Detection result"
                  className="w-full rounded-lg"
                />
              </div>

              {/* Grad-CAM Visualization */}
              {result.gradcamImage ? (
                <div className="rounded-xl bg-[#1E293B]/60 p-6 shadow-md">
                  <h3 className="mb-4 text-lg font-bold text-white">
                    Grad-CAM Visualization
                  </h3>
                  <p className="mb-3 text-sm text-[#92a4c8]">
                    Area yang diwarnai menunjukkan bagian penting yang
                    dipelajari model untuk deteksi batu ginjal.
                  </p>
                  <img
                    src={result.gradcamImage}
                    alt="Grad-CAM visualization"
                    className="w-full rounded-lg"
                    onError={(e) => {
                      console.error("[DEBUG] Error loading Grad-CAM image:", result.gradcamImage);
                      console.error("[DEBUG] Error event:", e);
                    }}
                    onLoad={() => {
                      console.log("[DEBUG] Grad-CAM image loaded successfully:", result.gradcamImage);
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-[#1E293B]/60 p-6 shadow-md">
                  <p className="text-sm text-[#92a4c8]">
                    Grad-CAM visualization tidak tersedia untuk gambar ini.
                  </p>
                  <p className="text-xs text-[#64748b] mt-2">
                    Debug: gradcamImage = {String(result.gradcamImage)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================== RIGHT COLUMN (Deskripsi + ChatBot) ==================== */}
        {result && !isClassifying && (
          <div className="flex flex-col gap-6 h-full">
            <div className="flex flex-col rounded-xl bg-[#1E293B]/60 p-6 shadow-md overflow-y-auto max-h-[121vh]">
              <h3 className="mb-4 text-lg font-bold text-white">
                Hasil Analisis AI
              </h3>

              <div className="space-y-6">
                {/* Tingkat bahaya */}
                <div>
                  <p className="text-sm text-[#92a4c8]">Tingkat Bahaya</p>
                  <p
                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-base font-semibold ${
                      result.label === "Aman"
                        ? "bg-green-500/10 text-green-400"
                        : result.label === "Ringan"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : result.label === "Sedang"
                        ? "bg-orange-500/10 text-orange-400"
                        : result.label === "Berat"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-red-700/10 text-red-500"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      local_hospital
                    </span>
                    {result.label}
                  </p>
                </div>

                {/* Tingkat keyakinan */}
                <div>
                  <p className="text-sm text-[#92a4c8]">Tingkat Keyakinan</p>
                  <p className="text-xl font-bold text-white">
                    {result.confidence}%
                  </p>
                  <div className="h-2.5 w-full rounded-full bg-[#334366] mt-2">
                    <div
                      className="h-2.5 rounded-full bg-primary"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Informasi model */}
                <div className="grid gap-3 rounded-xl border border-[#334366] bg-[#0f172a]/60 p-4 text-sm text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                        Prediksi Model
                      </p>
                      <p className="mt-1 font-semibold">
                        {result.prediction || "Tidak tersedia"}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Model
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                        Versi Model
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {result.modelVersion || "YOLOv8 KidneyStone"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                        Durasi Analisis
                      </p>
                      <p className="mt-1 text-sm font-medium">
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
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                      saving
                        ? "bg-primary/60 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      save
                    </span>
                    {saving ? "Saving..." : "Save Result to Patient"}
                  </button>
                </div>

                {/* Deskripsi AI */}
                <div className="text-white">
                  <p className="text-sm text-[#92a4c8]">Deskripsi AI</p>
                  <div className="mt-2 rounded-xl bg-[#020617]/40 p-3 text-sm leading-relaxed text-[#e2e8f0] border border-[#1e293b]">
                    <ReactMarkdown>{result.description}</ReactMarkdown>
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
    </main>
  );
}
