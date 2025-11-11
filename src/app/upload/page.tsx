// src/app/upload/page.tsx
"use client";

import ChatBot from "@/components/chatBot";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface DetectionResult {
  label: string;
  confidence: number;
  description: string;
  image: string;
  gradcamImage?: string;
}

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Handle pilih file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
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
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL_BE}/detect`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal mendeteksi gambar!");

      const data = await res.json();

      // Pastikan confidence dalam skala 0–100
      const confidence = Math.round(data.confidence * 100);

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

      setResult({
        confidence,
        label,
        description: data.description,
        image: `${process.env.NEXT_PUBLIC_BASEURL_BE}/static/uploads/${data.result_image}`,
        gradcamImage: data.gradcam_image 
          ? `${process.env.NEXT_PUBLIC_BASEURL_BE}/static/uploads/${data.gradcam_image}`
          : undefined,
      });
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
    if (fileInputRef.current) fileInputRef.current.value = "";
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
              {result.gradcamImage && (
                <div className="rounded-xl bg-[#1E293B]/60 p-6 shadow-md">
                  <h3 className="mb-4 text-lg font-bold text-white">
                    Grad-CAM Visualization
                  </h3>
                  <p className="mb-3 text-sm text-[#92a4c8]">
                    Area yang diwarnai menunjukkan bagian penting yang dipelajari model untuk deteksi batu ginjal.
                  </p>
                  <img
                    src={result.gradcamImage}
                    alt="Grad-CAM visualization"
                    className="w-full rounded-lg"
                  />
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

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#92a4c8]">Tingkat Bahaya</p>
                  <p
                    className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-base font-semibold ${
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
                    {result.label}
                  </p>
                </div>

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

                <div className="text-white">
                  <p className="text-sm text-[#92a4c8]">Deskripsi AI</p>
                  <ReactMarkdown>{result.description}</ReactMarkdown>
                </div>
              </div>
            </div>

            {/* ChatBot */}
            <ChatBot data={result.description} />
          </div>
        )}
      </div>
    </main>
  );
}
