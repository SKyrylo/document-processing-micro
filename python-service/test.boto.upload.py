import boto3
import os
from dotenv import load_dotenv
load_dotenv()


s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

s3.upload_file(
    "../test-files/Invoice_user00000001_2027-09-02-10-28-34.pdf",  # local file path
    "skyrylo-pdp-forma-bucket",  # bucket name
    "user-uploads/Invoice_user00000001_2027-09-02-10-28-34.pdf"  # s3 object key
)
