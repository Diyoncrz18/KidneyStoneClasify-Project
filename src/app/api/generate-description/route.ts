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
    const prompt = `Anda adalah ahli radiologi berpengalaman yang menganalisis hasil CT Scan untuk deteksi batu ginjal.

**Data Hasil Analisis:**
- Jumlah batu ginjal terdeteksi: ${stoneCount} ${stoneCount === 1 ? 'batu' : 'batu-batu'}
- Tingkat kepercayaan deteksi: ${confidenceScore}%
- Kategori tingkat keparahan: ${severityLabel}
- Metode deteksi: Model YOLOv8 (You Only Look Once) untuk deteksi objek

**Tugas Anda:**
Buatkan deskripsi analisis medis yang komprehensif dan profesional dalam bahasa Indonesia dengan struktur berikut:

1. **Ringkasan Hasil Analisis**
   - Berikan ringkasan singkat tentang hasil deteksi batu ginjal
   - Sebutkan jumlah batu ginjal yang terdeteksi dengan jelas

2. **Analisis Detail**
   - Jelaskan interpretasi dari jumlah batu ginjal yang terdeteksi
   - Analisis tingkat kepercayaan deteksi (${confidenceScore}%)
   - Penjelasan kategori ${severityLabel} dan implikasinya

3. **Tingkat Keparahan**
   - Berdasarkan kategori ${severityLabel} dan confidence score ${confidenceScore}%
   - Jelaskan apa artinya dalam konteks medis

4. **Rekomendasi Medis**
   - Berikan rekomendasi tindakan lanjutan yang sesuai
   - Saran untuk konsultasi dengan dokter spesialis jika diperlukan
   - Catatan penting tentang interpretasi hasil

**Panduan Penulisan:**
- Gunakan bahasa Indonesia yang jelas dan mudah dipahami
- Tetap profesional dan sesuai dengan konteks medis
- Hindari diagnosis definitif, gunakan istilah "indikasi" atau "menunjukkan"
- Fokus pada informasi yang bermanfaat untuk pasien dan tenaga medis
- Jika tidak ada batu yang terdeteksi (${stoneCount === 0 ? 'ya' : 'tidak'}), jelaskan dengan jelas

Buat deskripsi yang informatif, akurat, dan membantu dalam proses diagnosis lebih lanjut.`;

    // Call Gemini API
    // Using Google Generative AI REST API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
    
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

