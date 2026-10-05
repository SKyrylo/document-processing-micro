import pymupdf as pymu
import pathlib


class S3ExtractorToPyMuPDF:
    def __init__(
        self,
        s3_client,
    ):
        self.s3 = s3_client
    
    def extract(
        self,
        s3_bucket_name: str,
        s3_key: str
    ) -> pymu.Document:
        response = self.s3.get_object(
            Bucket=s3_bucket_name,
            Key=s3_key
        )

        file_bytes = response['Body'].read()

        filepath = pathlib.Path(s3_key)
        file_ext = filepath.suffix.lstrip('.').lower()

        if not file_ext:
            raise ValueError(f"File extension not found for file: {s3_key}")

        doc = pymu.open(stream=file_bytes, filetype=file_ext)

        return doc


if __name__ == "__main__":
    import boto3
    import os
    import matplotlib.pyplot as plt
    import numpy as np
    from dotenv import load_dotenv
    load_dotenv()

    s3 = boto3.client(
        's3',
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION")
    )

    # <=== TEST UPLOAD FILE TO S3 ===>
    # s3.upload_file(
    #     "../test-files/Invoice_user00000001_2027-09-02-10-28-34.pdf",  # local file path
    #     "skyrylo-pdp-forma-bucket",  # bucket name
    #     "user-uploads/Invoice_user00000001_2027-09-02-10-28-34.pdf"  # s3 object key
    # )

    
    # <=== TEST READ FILE FROM S3 ===>
    # response = s3.get_object(
    #     Bucket="skyrylo-pdp-forma-bucket",
    #     Key="user-uploads/Invoice_user00000001_2027-09-02-10-28-34.pdf"
    # )

    # file_bytes = response['Body'].read()
    # doc = pymu.open(stream=file_bytes, filetype='pdf')
    # print(f"Page count: {len(doc)}, doc type: {type(doc)}. client type: {type(s3)}")

    # page = doc[0].get_pixmap()
    # img_np = np.frombuffer(page.samples, dtype=np.uint8).reshape(page.height, page.width, 3)
    # plt.imshow(img_np)
    # plt.show()
