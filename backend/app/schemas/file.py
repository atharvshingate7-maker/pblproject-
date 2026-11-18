from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class FileBase(BaseModel):
    filename: str
    original_name: str
    file_size: int
    content_type: str
    sha256_hash: str


class FileCreate(FileBase):
    user_id: str
    file_path: str
    storage_provider: str = "local"


class FileRead(FileBase):
    id: str
    user_id: str
    file_path: str
    storage_provider: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FileUploadResponse(BaseModel):
    status: str = "success"
    message: str = "File uploaded and verified successfully"
    file: FileRead
