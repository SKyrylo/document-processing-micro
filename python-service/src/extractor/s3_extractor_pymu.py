import pymupdf as pymu
import boto3
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
