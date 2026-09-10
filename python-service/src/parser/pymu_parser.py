import pymupdf as pymu


class PyMuParser:
    def __init__(self):
        pass



if __name__ == "__main__":
    doc = pymu.open('../test-files/invoice.pdf')
    page = doc[0]

    # text = page.get_text()
    # formatted_text = "".join(page.get_text().split())
    # print(formatted_text)
    # print(len(text))
    # print(len(formatted_text))
    print(len(page.get_images()))

    print(page.rect.width, page.rect.height, page.rect.area)

    info = page.get_image_info()

    for img in info:
        print(img['width'], img['height'])
        print(img['bbox'])
