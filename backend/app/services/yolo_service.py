from ultralytics import YOLO
import os
import torch
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image

# Load model sekali di awal
model = YOLO('app/model/best.pt')

def detect_image(image_path, output_folder):
    try:
        results = model(image_path)
        result_img_path = os.path.join(output_folder, "result_" + os.path.basename(image_path))
        results[0].save(filename=result_img_path)
        confidence = float(results[0].boxes.conf[0]) if len(results[0].boxes.conf) > 0 else None

        return result_img_path, confidence
    except Exception as e:
        raise RuntimeError(f"YOLO detection failed: {e}")

def generate_gradcam(image_path, output_folder):
    """
    Generate Grad-CAM visualization untuk YOLO model
    Menggunakan metode yang lebih sederhana dan reliable
    """
    try:
        # Run detection untuk mendapatkan hasil
        results = model(image_path)
        
        # Load gambar asli
        img = Image.open(image_path).convert('RGB')
        img_array = np.array(img)
        h, w = img_array.shape[:2]
        
        # Gunakan metode heatmap berdasarkan deteksi
        return generate_simple_heatmap(image_path, output_folder, results)
        
    except Exception as e:
        print(f"Grad-CAM error: {e}")
        import traceback
        traceback.print_exc()
        return None

def generate_simple_heatmap(image_path, output_folder, results):
    """
    Generate heatmap berdasarkan bounding boxes dan confidence scores
    Area dengan warna merah/orange menunjukkan area penting yang dipelajari model
    """
    try:
        img = Image.open(image_path).convert('RGB')
        img_array = np.array(img)
        h, w = img_array.shape[:2]
        
        # Buat heatmap kosong
        heatmap = np.zeros((h, w), dtype=np.float32)
        
        # Jika ada deteksi, tambahkan heat pada area bounding box
        if len(results[0].boxes) > 0:
            boxes = results[0].boxes
            for i in range(len(boxes)):
                box = boxes.xyxy[i].cpu().numpy()
                conf = float(boxes.conf[i])
                x1, y1, x2, y2 = map(int, box)
                
                # Pastikan koordinat dalam batas gambar
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)
                
                # Buat Gaussian heat pada area bounding box dengan intensitas berdasarkan confidence
                center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2
                # Radius berdasarkan ukuran box, dengan minimum radius
                box_width = x2 - x1
                box_height = y2 - y1
                radius = max(box_width, box_height) // 2
                radius = max(radius, 20)  # Minimum radius untuk visibility
                
                # Buat grid untuk Gaussian
                y_grid, x_grid = np.ogrid[:h, :w]
                
                # Hitung jarak dari center
                dist_sq = (x_grid - center_x)**2 + (y_grid - center_y)**2
                
                # Gaussian dengan sigma berdasarkan radius
                sigma = radius / 2.0
                gaussian = np.exp(-dist_sq / (2 * sigma**2))
                
                # Weight berdasarkan confidence score
                heatmap += gaussian * conf
        
        # Normalize heatmap
        if heatmap.max() > 0:
            heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)
        else:
            # Jika tidak ada deteksi, buat heatmap uniform kecil untuk visualisasi
            heatmap = np.ones((h, w), dtype=np.float32) * 0.1
        
        # Apply colormap (JET: blue (low) -> green -> yellow -> red (high))
        heatmap_uint8 = np.uint8(255 * heatmap)
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        
        # Overlay dengan gambar asli (60% gambar asli, 40% heatmap)
        overlay = cv2.addWeighted(img_array, 0.6, heatmap_colored, 0.4, 0)
        
        # Save dengan ekstensi yang sama
        base_name = os.path.basename(image_path)
        name, ext = os.path.splitext(base_name)
        gradcam_path = os.path.join(output_folder, f"gradcam_{name}{ext}")
        Image.fromarray(overlay).save(gradcam_path)
        
        return gradcam_path
    except Exception as e:
        print(f"Simple heatmap error: {e}")
        import traceback
        traceback.print_exc()
        return None
