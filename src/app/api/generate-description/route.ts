import { NextRequest, NextResponse } from 'next/server';

// Set runtime to nodejs to ensure fetch works properly
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Parse request body once and store for error handling
  let body: any = {};
  let stoneCount = 0;
  let confidenceScore = 0;
  let severityLabel = 'Tidak diketahui';
  
  try {
    // Parse request body with error handling
    try {
      body = await request.json();
      console.log('[Generate Description] Request received:', {
        hasImageUrl: !!body.imageUrl,
        hasDetectionData: !!body.detectionData,
        confidence: body.confidence,
        label: body.label
      });
    } catch (parseError: any) {
      console.error('[Generate Description] Failed to parse request body:', parseError);
      return NextResponse.json({ 
        description: generateFallbackDescription(0, 0, 'Tidak diketahui'),
        success: false,
        error: 'Invalid request body format' 
      });
    }
    
    const { imageUrl, detectionData, confidence, label } = body;

    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.warn('[Generate Description] Gemini API key not found, using fallback');
      // Extract data for fallback
      if (detectionData?.detections && Array.isArray(detectionData.detections)) {
        stoneCount = detectionData.detections.length;
      } else if (detectionData?.count !== undefined) {
        stoneCount = detectionData.count;
      }
      confidenceScore = confidence || 0;
      severityLabel = label || 'Tidak diketahui';
      
      const fallbackDescription = generateFallbackDescription(stoneCount, confidenceScore, severityLabel);
      return NextResponse.json({ 
        description: fallbackDescription,
        success: false,
        error: 'Gemini API key tidak ditemukan. Menggunakan deskripsi fallback.' 
      });
    }

    // Count detected kidney stones from detection data
    // Try multiple ways to get detection count
    if (detectionData?.detections && Array.isArray(detectionData.detections)) {
      stoneCount = detectionData.detections.length;
    } else if (detectionData?.detections && typeof detectionData.detections === 'number') {
      stoneCount = detectionData.detections;
    } else if (detectionData?.count !== undefined) {
      stoneCount = detectionData.count;
    }
    
    confidenceScore = confidence || 0;
    severityLabel = label || 'Tidak diketahui';

    // Prepare detailed prompt for Gemini
    const stoneDetected = stoneCount > 0;
    const prompt = `Anda adalah dokter spesialis urologi berpengalaman yang menganalisis hasil CT Scan ginjal.

**DATA DETEKSI DARI MODEL AI (YOLOv8):**
- Hasil Prediksi: ${stoneDetected ? 'Batu Ginjal Terdeteksi' : 'Tidak Ada Batu Ginjal Terdeteksi'}
- Jumlah area deteksi (bounding box): ${stoneCount}
- Tingkat kepercayaan model: ${confidenceScore}%
- Kategori tingkat keparahan: ${severityLabel}

**INSTRUKSI:**
Berikan deskripsi analisis medis yang komprehensif dan profesional dalam bahasa Indonesia.
PENTING: Deskripsi HARUS konsisten dengan data deteksi di atas. Jangan membuat informasi yang bertentangan.

${stoneDetected ? `Karena model mendeteksi ${stoneCount} area batu ginjal dengan confidence ${confidenceScore}%, berikan analisis yang mencakup:` : 'Karena model TIDAK mendeteksi batu ginjal, jelaskan bahwa hasil pemeriksaan normal.'}

**FORMAT OUTPUT (gunakan Markdown):**

## Ringkasan Hasil Analisis
- ${stoneDetected ? `Jelaskan bahwa terdeteksi ${stoneCount} area batu ginjal` : 'Jelaskan bahwa tidak terdeteksi batu ginjal'}
- Sebutkan tingkat kepercayaan deteksi: ${confidenceScore}%

## Analisis Detail
- ${stoneDetected ? 'Interpretasi jumlah dan area deteksi batu ginjal' : 'Menjelaskan kondisi ginjal tampak normal'}
- Analisis tingkat kepercayaan ${confidenceScore}% dan kategori ${severityLabel}
- ${stoneDetected ? 'Perkiraan dampak klinis dari temuan' : 'Pencegahan batu ginjal'}

## Tingkat Keparahan: ${severityLabel}
- Penjelasan medis tentang kategori ${severityLabel}
- Apa artinya bagi pasien

## Rekomendasi Medis
- Tindakan lanjutan sesuai tingkat keparahan
- ${stoneDetected ? 'Rujukan ke spesialis jika diperlukan' : 'Pemeriksaan rutin berkala'}
- Catatan bahwa hasil ini adalah bantuan diagnosis, bukan pengganti konsultasi medis

**PANDUAN:**
- Gunakan bahasa Indonesia yang jelas dan profesional
- Gunakan istilah "indikasi" atau "menunjukkan", bukan diagnosis pasti
- Jangan melebihi data deteksi yang diberikan
- Jika ${stoneCount} batu terdeteksi, jangan katakan jumlah berbeda`;

    // Call Gemini API
    // Using Google Generative AI REST API (gemini-2.0-flash for better accuracy)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    
    console.log('[Generate Description] Calling Gemini API...');
    
    let geminiResponse: Response;
    try {
      geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      });
    } catch (fetchError: any) {
      console.error('[Generate Description] Fetch error:', fetchError);
      throw new Error(`Failed to connect to Gemini API: ${fetchError.message}`);
    }

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      console.error('[Generate Description] Gemini API Error:', {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        error: errorData
      });
      
      // Don't throw error, use fallback instead
      const fallbackDescription = generateFallbackDescription(stoneCount, confidenceScore, severityLabel);
      return NextResponse.json({ 
        description: fallbackDescription,
        success: false,
        error: `Gemini API error: ${geminiResponse.status} - ${errorData.error?.message || errorData.message || 'Unknown error'}` 
      });
    }

    let geminiData: any;
    try {
      geminiData = await geminiResponse.json();
      console.log('[Generate Description] Gemini API response received');
    } catch (parseError: any) {
      console.error('[Generate Description] Failed to parse Gemini response:', parseError);
      const fallbackDescription = generateFallbackDescription(stoneCount, confidenceScore, severityLabel);
      return NextResponse.json({ 
        description: fallbackDescription,
        success: false,
        error: 'Failed to parse Gemini API response' 
      });
    }
    
    // Extract description from Gemini response
    let description = '';
    
    if (geminiData.candidates && geminiData.candidates[0]?.content?.parts) {
      description = geminiData.candidates[0].content.parts
        .map((part: any) => part.text || '')
        .join('\n');
    } else if (geminiData.promptFeedback?.blockReason) {
      console.warn('[Generate Description] Content blocked by safety filter:', geminiData.promptFeedback.blockReason);
    }

    // If description is blocked or empty, provide fallback
    if (!description || description.trim() === '') {
      console.log('[Generate Description] Description empty or blocked, using fallback');
      description = generateFallbackDescription(stoneCount, confidenceScore, severityLabel);
    } else {
      console.log('[Generate Description] Description generated successfully, length:', description.length);
    }

    return NextResponse.json({ 
      description,
      success: true 
    });

  } catch (error: any) {
    console.error('[Generate Description] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Use stored body data or defaults for fallback description
    if (body && Object.keys(body).length > 0) {
      const detectionData = body.detectionData || {};
      if (detectionData.detections && Array.isArray(detectionData.detections)) {
        stoneCount = detectionData.detections.length;
      } else if (detectionData.count !== undefined) {
        stoneCount = detectionData.count;
      }
      confidenceScore = body.confidence || 0;
      severityLabel = body.label || 'Tidak diketahui';
    }
    
    const fallbackDescription = generateFallbackDescription(stoneCount, confidenceScore, severityLabel);
    
    // Always return 200 with fallback description, never 500
    return NextResponse.json({ 
      description: fallbackDescription,
      success: false,
      error: error.message || 'Terjadi kesalahan saat menghasilkan deskripsi' 
    });
  }
}

function generateFallbackDescription(stoneCount: number, confidence: number, label: string): string {
  const countText = stoneCount === 0 
    ? 'Tidak terdeteksi batu ginjal' 
    : stoneCount === 1 
    ? 'Terdeteksi 1 batu ginjal' 
    : `Terdeteksi ${stoneCount} batu ginjal`;

  const severityText = {
    'Aman': 'Hasil analisis menunjukkan kondisi yang relatif aman dengan tingkat kepercayaan rendah.',
    'Ringan': 'Hasil analisis menunjukkan indikasi ringan dengan beberapa tanda yang perlu diperhatikan.',
    'Sedang': 'Hasil analisis menunjukkan indikasi sedang yang memerlukan perhatian medis lebih lanjut.',
    'Berat': 'Hasil analisis menunjukkan indikasi berat yang memerlukan evaluasi medis segera.',
    'Sangat Serius': 'Hasil analisis menunjukkan indikasi sangat serius yang memerlukan perhatian medis segera.'
  }[label] || 'Hasil analisis menunjukkan deteksi batu ginjal.';

  return `## Ringkasan Hasil Analisis

**${countText}** dalam CT Scan yang dianalisis.

### Tingkat Keparahan
${severityText} Tingkat kepercayaan deteksi: **${confidence}%**.

### Rekomendasi
Disarankan untuk berkonsultasi dengan dokter spesialis urologi untuk evaluasi lebih lanjut dan penanganan yang sesuai. Hasil ini merupakan bantuan diagnosis dan tidak menggantikan konsultasi medis profesional.`;
}

