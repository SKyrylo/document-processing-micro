- gRPC:
    1. python receives the bucket name and file path key. 
    2. python returns structured output directly via Protobuf OR uploads to S3 (research)
    3. make sure to catch and process errors from python process (e.g. ValueError("File extension not found")) in the .proto file

- Nest/Next:
    1. python errors catched with .proto should be processed
    2. make JWT auth/refresh + UI with next for document uploading

- Python
    1. adapt the pymupdf logic to non-pdf types (currently only tested for pdf)
    2. make a separate parser for each doc type
    3. async calling for ocr