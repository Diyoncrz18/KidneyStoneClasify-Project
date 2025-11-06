// src/app/upload/page.tsx
"use client";

import { useState, useRef } from "react";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true); // Tambahkan ini
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null); // Reset hasil sebelumnya
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleClassify = () => {
    if (!selectedFile) {
      alert('Please select an image first.');
      return;
    }

    setIsClassifying(true);
    // Simulasi proses klasifikasi (ganti dengan API call ke backend nanti)
    setTimeout(() => {
      // Contoh hasil: 80% CKD, 20% Healthy → kita ambil yang tertinggi
      const isCKD = Math.random() > 0.5;
      const confidence = Math.floor(Math.random() * 20) + 80; // 80–99%
      setResult({
        label: isCKD ? 'CKD Stage 3' : 'Healthy',
        confidence,
      });
      setIsClassifying(false);
    }, 1200);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="flex-1 overflow-y-auto p-10">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-3xl font-bold leading-tight tracking-[-0.033em] text-white">
            Upload Images
          </p>
          <p className="text-base font-normal leading-normal text-[#92a4c8]">
            Upload a kidney scan image for AI-powered analysis.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column: Upload and Preview */}
        <div className="flex flex-col gap-6">
          {/* Upload Zone */}
          {!previewUrl ? (
            <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#334366] px-6 py-14">
              <div className="flex max-w-[480px] flex-col items-center gap-2">
                <span className="material-symbols-outlined text-5xl text-primary">
                  cloud_upload
                </span>
                <p className="max-w-[480px] text-center text-lg font-bold leading-tight tracking-[-0.015em] text-white">
                  Drag & drop your image here, or click to select a file
                </p>
                <p className="max-w-[480px] text-center text-sm font-normal leading-normal text-[#92a4c8]">
                  Supports: JPG, PNG, DICOM
                </p>
              </div>
              <button
                onClick={handleSelectClick}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#242f47] text-sm font-bold leading-normal tracking-[0.015em] text-white"
              >
                <span className="truncate">Select File</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.dcm"
                className="hidden"
              />
            </div>
          ) : (
            <div className="rounded-xl bg-[#1E293B]/60 p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Image Preview</h3>
                <button
                  onClick={handleRemoveImage}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#111621] flex items-center justify-center">
                <img
                  alt="Uploaded kidney scan"
                  className="h-full w-full object-contain"
                  src={previewUrl}
                  onLoad={() => URL.revokeObjectURL(previewUrl)}
                />
              </div>

              {/* Classify Button */}
              <div className="mt-6 flex w-full">
                <button
                  onClick={handleClassify}
                  disabled={isClassifying}
                  className={`flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text-base font-bold leading-normal tracking-[0.015em] text-white hover:bg-primary/90 transition-colors ${isClassifying ? 'opacity-70' : ''}`}
                >
                  {isClassifying ? 'Classifying...' : 'Classify Image'}
                </button>
              </div>

              {/* Result */}
              {result && (
                <div className="mt-6 rounded-xl bg-[#1E293B]/60 p-6 shadow-md">
                  <h3 className="mb-4 text-lg font-bold text-white">Classification Results</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-[#92a4c8]">Predicted Label</p>
                      <p className="mt-1 text-2xl font-bold text-white">{result.label}</p>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#92a4c8]">Confidence Score</p>
                        <p className="text-sm font-bold text-primary">{result.confidence}%</p>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-[#334366]">
                        <div
                          className="h-2.5 rounded-full bg-primary"
                          style={{ width: `${result.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Action and Results */}
        <div className="flex flex-col gap-6">
          {/* Results Card - Hanya tampil jika ada hasil */}
          {result && (
            <div className="flex h-full flex-col rounded-xl bg-[#1E293B]/60 p-6 shadow-md">
              <h3 className="mb-4 text-lg font-bold text-white">
                Classification Results
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-[#92a4c8]">
                    Predicted Label
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {result.label}
                  </p>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-medium text-[#92a4c8]">
                      Confidence Score
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {result.confidence}%
                    </p>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#334366]">
                    <div
                      className="h-2.5 rounded-full bg-primary"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-solid border-[#334366]">
                  <p className="text-sm font-medium text-white">
                    Show Heatmap Overlay
                  </p>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    role="switch"
                    aria-checked={showHeatmap}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        showHeatmap ? "translate-x-5" : "translate-x-0"
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Details Modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-xl bg-white dark:bg-[#1E293B] shadow-md">
            <div className="flex items-center justify-between border-b border-[#242f47] p-4">
              <h2 className="text-lg font-semibold text-white">
                Result Details
              </h2>
              <button
                onClick={() => setResult(null)}
                className="rounded-full p-1 text-[#92a4c8] hover:bg-[#242f47]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              {/* Image with Heatmap */}
              <div className="relative aspect-square">
                <img
                  alt="Enlarged kidney scan"
                  className="h-full w-full rounded-xl object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkRjf8bk82fVF1ZKEYunUy4h5UmQw_C_z28NDtu5Fz5dhtuve_t2M3_go7MYL8BHH1zDmsIq7s0FvRiMHht55DBQv6OthYKcNvlWD_z1woyisLaklKNe8_DidO8Zma6lGCS-eYfRsULX5chXsaC9e_urnILcwz6fIx-GICG3xEpiBWGOxcbdHai5Thdm4Iz8IaIxGiZp8kIEspyCeIuMrrRkLTykW0Wg5UzkBKGX-1q1l9IGSZoD9fzkyLi4GZH-bIHqsftIyV0Is  "
                />
                {showHeatmap && (
                  <img
                    alt="Grad-CAM heatmap overlay"
                    className="absolute inset-0 h-full w-full rounded-xl object-cover opacity-50"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNsUmubuBHmGQiH3-9NsXXNxff5a2tUkU-_ISY18ZfM75dVwgdqoBOgjZe1Fipqx8CwkCUQoGC1v27mFPyoIEPv8IjyZpZPVZdXiSa7PM0jXV-MDjjfAEp2oLU4EsDAPDkOuK8SStDAlOq0w288w6IonTkowZnY96AKXgZApSVxgWx8ckZtBwhOi3FiclgvsjQr1CJ51Si7Qj9RoMVU3hgv2cGuzfmpmeuBDlWYuM9IPt8cMykZjGpbvvGs_yvCzR6TsQy291VJuk  "
                  />
                )}
              </div>

              {/* Result Info */}
              <div className="flex flex-col">
                <div className="mb-6 space-y-4">
                  <div>
                    <h3 className="text-sm text-[#92a4c8]">Predicted Label</h3>
                    <p className="inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-base font-medium text-red-400">
                      CKD
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-[#92a4c8]">Confidence</h3>
                    <p className="text-2xl font-bold text-white">92%</p>
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-[#242f47]/30 p-3">
                    <label
                      className="font-medium text-white"
                      htmlFor="modal-heatmap"
                    >
                      Grad-CAM Heatmap
                    </label>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        id="modal-heatmap"
                        type="checkbox"
                        className="peer sr-only"
                        checked={showHeatmap}
                        onChange={() => setShowHeatmap(!showHeatmap)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-[#334366] after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#334366] after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </div>
                  <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white shadow-md hover:bg-primary/90">
                    <span className="material-symbols-outlined">download</span>
                    Download Result
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}