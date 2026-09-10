import pymupdf as pymu


def check_page_needs_ocr(
    page: pymu.Page,
    images_union_thresh_ocr: float,
    char_thresh_num_ocr: int
) -> bool:
    images_union_area = get_images_union_area(page.get_image_info())
    page_area = page.rect.width * page.rect.height
    area_exceeds_thresh = (images_union_area / page_area) > images_union_thresh_ocr

    text_only_chars = "".join(page.get_text().split())
    text_falls_behind_thresh = len(text_only_chars) <= char_thresh_num_ocr

    return area_exceeds_thresh or text_falls_behind_thresh


def get_images_union_area(images_info: list[dict]) -> float:
    bboxes = [img['bbox'] for img in images_info]

    if not bboxes:
        return 0.0
    
    events = []
    
    # Sweep Line Algorithm to find union area of images
    for (x1, y1, x2, y2) in bboxes:
        if x1 < x2 and y1 < y2:
            events.append((x1, 1, y1, y2))  # Type 1: Start
            events.append((x2, -1, y1, y2))  # Type -1: End
    
    events.sort(key=lambda el: el[0])
    prev_x = events[0][0] if events else 0
    total_area = 0.0
    intervals = []

    for x, state, y1, y2 in events:
        dx = x - prev_x
        total_area += dx * _get_total_covered_y_length(intervals)

        if state == 1:
            intervals.append((y1, y2))
        elif state == -1:
            intervals.remove((y1, y2))

        prev_x = x
    
    return total_area


def _get_total_covered_y_length(intervals: list[tuple[float, float]]):
    """Calculates union length of 1D overlapping line segments.
    Used for calculating union area of images in get_images_union_area."""

    if not intervals:
        return 0.0
    
    sorted_intervals = sorted(intervals, key=lambda tup: tup[0])
    cur_start, cur_end = sorted_intervals[0]
    total_len = 0.0

    for start, end in sorted_intervals[1:]:
        if start < cur_end:
            cur_end = max(cur_end, end)
        else:
            total_len += cur_end - cur_start
            cur_start, cur_end = start, end
    
    total_len += cur_end - cur_start
    return total_len


if __name__ == "__main__":
    doc = pymu.open("../test-files/base64image.pdf")
    page = doc[0]
    images_dicts = page.get_image_info()
    print(images_dicts)

    print(f"Union Area:", get_images_union_area(images_dicts))
    print(f"Page Needs OCR: {check_page_needs_ocr(page, 0.1, 100)}")
