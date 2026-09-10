import io 
import boto3
import pymupdf as pymu
import matplotlib.pyplot as plt
import os
import numpy as np
from dotenv import load_dotenv

load_dotenv()


s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
    )

response = s3.get_object(
    Bucket="skyrylo-pdp-forma-bucket",
    Key="user-uploads/Invoice_user00000001_2027-09-02-10-28-34.pdf"
)

file_bytes = response['Body'].read()

doc = pymu.open(stream=file_bytes, filetype='pdf')

print(f"Page count: {len(doc)}, doc type: {type(doc)}. client type: {type(s3)}")

page = doc[0].get_pixmap()

img_np = np.frombuffer(page.samples, dtype=np.uint8).reshape(page.height, page.width, 3)

plt.imshow(img_np)
plt.show()
