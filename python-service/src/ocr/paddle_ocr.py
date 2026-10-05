from paddleocr import PaddleOCR, TextRecognition, TextDetection
from typing import TypeAlias, TypedDict
import numpy as np


Path: TypeAlias = str
PageIndex: TypeAlias = int
ImageArray: TypeAlias = np.ndarray          # shape=(H,W,C) where C is the number of channels
DetPolygons: TypeAlias = np.ndarray         # shape=(N,4,2) where N is the number of detected text boxes
ConfScores: TypeAlias = list[float]         # shape=(N,) where N is the number of detected text boxes

ImageDet = TypedDict(
    "ImageDet",
    {"input_path": Path, "page_index": PageIndex, "input_img": ImageArray, "dt_polys": DetPolygons, "dt_scores": ConfScores}
)
ImgCroppedRegions = TypedDict(
    "ImgCroppedRegions",
    {"input_path": Path, "page_index": PageIndex, "cropped_imgs": list[ImageArray], "dt_polys": DetPolygons}
)
ImgRecognitions = TypedDict(
    "ImgRecognitions",
    {"input_path": Path, "page_index": PageIndex, "rec_texts": list[str], "dt_polys": DetPolygons, "rec_scores": ConfScores}
)


class PaddleOCRPerformer:
    def __init__(
        self,
        det_model_name="PP-OCRv6_tiny_det",
        det_model_dir="models/text_detection/PP-OCRv6_tiny_det_infer",
        rec_model_name="PP-OCRv6_tiny_rec",
        rec_model_dir="models/text_recognition/PP-OCRv6_tiny_rec_infer"
        ) -> None:
        self.det = TextDetection(
            model_name=det_model_name,
            model_dir=det_model_dir
        )
        self.rec = TextRecognition(
            model_name=rec_model_name,
            model_dir=rec_model_dir
        )

    @staticmethod
    def crop_single_text_region(
        img: np.ndarray,
        polygon: np.ndarray
    ) -> np.ndarray:
        x = int(np.clip(np.floor(polygon[:, 0].min()), 0, img.shape[1]))
        y = int(np.clip(np.floor(polygon[:, 1].min()), 0, img.shape[0]))
        x1 = int(np.clip(np.ceil(polygon[:, 0].max()), 0, img.shape[1]))
        y1 = int(np.clip(np.ceil(polygon[:, 1].max()), 0, img.shape[0]))
        
        return img[y:y1, x:x1]
    
    def detect(
        self,
        images: list[str],
        batch_size=1
        ) -> list[ImageDet]:
        return self.det.predict(images, batch_size=batch_size)
    
    def crop_all_text_regions(
        self,
        dets: list[ImageDet],
        threshold=0.5
    ) -> list[ImgCroppedRegions]:
        imgdets = []

        for det in dets:
            input_path = det['input_path']
            page_index = det['page_index']
            input_img = det['input_img']
            dt_polys = det['dt_polys']
            dt_scores = det['dt_scores']

            cropped_imgs = []
            polys = []

            for polygon, score in zip(dt_polys, dt_scores):
                if score > threshold:
                    cropped = self.crop_single_text_region(input_img, polygon)
                    if cropped.size > 0:
                        cropped_imgs.append(cropped)
                        polys.append(polygon)
            dt_polys_arr = np.array(polys) if polys else np.empty((0, 4, 2), dtype=np.int32)
            imgdets.append({'input_path': input_path, 'page_index': page_index, 'cropped_imgs': cropped_imgs, 'dt_polys': dt_polys_arr})
        
        return imgdets

    def recognize(
        self,
        dets: list[ImgCroppedRegions],
        batch_size=1
        ) -> list[ImgRecognitions]:
        flattened_imgs = [img for det in dets for img in det['cropped_imgs']]

        if not flattened_imgs:
            return [
                {
                    'input_path': det['input_path'],
                    'page_index': det['page_index'],
                    'rec_texts': [],
                    'dt_polys': det['dt_polys'],
                    'rec_scores': [],
                }
                for det in dets
            ]

        flat_rec = self.rec.predict(flattened_imgs, batch_size=batch_size)

        idx = 0
        structured_recs = []
        for det in dets:
            input_path = det['input_path']
            page_index = det['page_index']
            cropped_imgs = det['cropped_imgs']
            dt_polys = det['dt_polys']

            page_recs = flat_rec[idx:idx+len(cropped_imgs)]
            rec_texts = [el['rec_text'] for el in page_recs]
            rec_scores = [el['rec_score'] for el in page_recs]
            idx += len(cropped_imgs)

            structured_recs.append({'input_path': input_path, 'page_index': page_index, 'rec_texts': rec_texts, 'dt_polys': dt_polys, 'rec_scores': rec_scores})

        return structured_recs


if __name__ == "__main__":
    import matplotlib.pyplot as plt
    from time import time
    from paddleocr import PaddleOCR

    pdf_path = "test-files/base64image.pdf"

    # 1. Custom Performer Benchmark (Tiny models + flattened batching)
    performer = PaddleOCRPerformer()
    t0 = time()
    dets = performer.detect([pdf_path])
    regions = performer.crop_all_text_regions(dets)
    recs = performer.recognize(regions)
    performer_time = time() - t0

    # 2. Official PaddleOCR Pipeline Benchmark (Tiny models)
    full_ocr = PaddleOCR(
        text_detection_model_name="PP-OCRv6_tiny_det",
        text_detection_model_dir="models/text_detection/PP-OCRv6_tiny_det_infer",
        text_recognition_model_name="PP-OCRv6_tiny_rec",
        text_recognition_model_dir="models/text_recognition/PP-OCRv6_tiny_rec_infer",
        use_doc_orientation_classify=False,  # Disable page orientation
        use_doc_unwarping=False,             # Disable document unwarping
        use_textline_orientation=False,      # Disable textline rotation
        lang="en"
    )

    t0 = time()
    full_results = full_ocr.predict(pdf_path)
    full_time = time() - t0

    # 3. Print Performance Comparison
    print(f"Custom Performer Time  : {performer_time:.3f} seconds")
    print(f"Official Pipeline Time : {full_time:.3f} seconds")
    print(f"Speedup                : {full_time / performer_time:.2f}x faster")

    # 4. Visualize results on PaddleOCR internal image
    img_np = dets[0]['input_img']
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.imshow(img_np)

    for poly, text in zip(recs[0]['dt_polys'], recs[0]['rec_texts']):
        ax.plot(poly[:, 0], poly[:, 1], color='lime', linewidth=1.5)
        ax.text(poly[:, 0].min(), poly[:, 1].min() - 2, text, color='lime', fontsize=8, backgroundcolor='black')

    plt.axis('off')
    plt.tight_layout()
    plt.show()