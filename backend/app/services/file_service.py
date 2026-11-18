import os
import uuid
import hashlib
import asyncio
import aiofiles
from typing import List, Optional, Tuple, Dict, Any
from fastapi import UploadFile, HTTPException, status
from supabase import Client

from app.core.config import settings


class FileService:

    @staticmethod
    def validate_file(file: UploadFile) -> str:
        if not file.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Filename cannot be empty")
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in settings.ALLOWED_EXTENSIONS:
            allowed = ", ".join(settings.ALLOWED_EXTENSIONS)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '.{ext}'. Allowed: {allowed}"
            )
        return ext

    @staticmethod
    async def process_and_store_upload(
        file: UploadFile,
        user_id: str,
        supabase: Client
    ) -> Dict[str, Any]:
        FileService.validate_file(file)
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        unique_id = str(uuid.uuid4())
        safe_filename = f"{unique_id}_{file.filename}"
        local_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

        sha256 = hashlib.sha256()
        total_size = 0

        async with aiofiles.open(local_path, "wb") as out_file:
            while chunk := await file.read(65536):
                total_size += len(chunk)
                if total_size > settings.max_file_size_bytes:
                    await out_file.close()
                    if os.path.exists(local_path):
                        os.remove(local_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit"
                    )
                sha256.update(chunk)
                await out_file.write(chunk)

        content_type = file.content_type or "application/octet-stream"
        file_hash = sha256.hexdigest()
        storage_provider = "local"
        final_path = local_path

        # Upload to Supabase Storage
        try:
            async with aiofiles.open(local_path, "rb") as f:
                file_bytes = await f.read()
            storage_path = f"{user_id}/{safe_filename}"
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
                    path=storage_path,
                    file=file_bytes,
                    file_options={"content-type": content_type}
                )
            )
            final_path = storage_path
            storage_provider = "supabase_storage"
        except Exception:
            pass  # Keep local fallback

        # Insert into Supabase DB
        record = {
            "id": unique_id,
            "user_id": user_id,
            "filename": safe_filename,
            "original_name": file.filename,
            "file_path": final_path,
            "file_size": total_size,
            "content_type": content_type,
            "sha256_hash": file_hash,
            "storage_provider": storage_provider
        }
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(
            None,
            lambda: supabase.table("files").insert(record).execute()
        )
        return res.data[0] if res.data else record

    @staticmethod
    async def get_user_files(
        supabase: Client,
        user_id: str,
        offset: int = 0,
        limit: int = 20
    ) -> Tuple[List[Dict], int]:
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(
            None,
            lambda: supabase.table("files")
                .select("*", count="exact")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
        )
        return res.data or [], res.count or 0

    @staticmethod
    async def get_file_by_id(
        supabase: Client,
        file_id: str,
        user_id: Optional[str] = None
    ) -> Optional[Dict]:
        loop = asyncio.get_event_loop()
        query = lambda: (
            supabase.table("files").select("*").eq("id", file_id).eq("user_id", user_id).maybe_single().execute()
            if user_id else
            supabase.table("files").select("*").eq("id", file_id).maybe_single().execute()
        )
        res = await loop.run_in_executor(None, query)
        return res.data if res else None

    @staticmethod
    async def delete_file(
        supabase: Client,
        file_id: str,
        user_id: str
    ) -> bool:
        db_file = await FileService.get_file_by_id(supabase, file_id, user_id)
        if not db_file:
            return False

        # Remove from local disk if present
        local_path = db_file.get("file_path", "")
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass

        # Remove from Supabase Storage
        if db_file.get("storage_provider") == "supabase_storage":
            try:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(
                    None,
                    lambda: supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET)
                        .remove([f"{user_id}/{db_file['filename']}"])
                )
            except Exception:
                pass

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: supabase.table("files").delete().eq("id", file_id).execute()
        )
        return True
