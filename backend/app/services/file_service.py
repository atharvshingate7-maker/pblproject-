import os
import uuid
import hashlib
import aiofiles
from typing import List, Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.config import settings
from app.db.models import FileModel
from app.db.supabase import upload_to_supabase_storage, delete_from_supabase_storage
from app.schemas.file import FileCreate, FileRead


class FileService:
    @staticmethod
    def validate_file(file: UploadFile) -> str:
        """
        Validates file extension and filename safety.
        Returns the sanitized extension.
        """
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Filename cannot be empty"
            )

        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in settings.ALLOWED_EXTENSIONS:
            allowed = ", ".join(settings.ALLOWED_EXTENSIONS)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '.{ext}'. Allowed formats: {allowed}"
            )
        return ext

    @staticmethod
    async def process_and_store_upload(
        file: UploadFile,
        user_id: str,
        db: AsyncSession
    ) -> FileModel:
        """
        Validates file size, calculates SHA-256 hash, stores file (Supabase Storage or disk),
        and records metadata in PostgreSQL database.
        """
        ext = FileService.validate_file(file)

        # Ensure local upload dir exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        unique_id = str(uuid.uuid4())
        safe_filename = f"{unique_id}_{file.filename}"
        local_dest_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

        sha256 = hashlib.sha256()
        total_size = 0

        # Stream save file to calculate hash & check size without loading entire file in memory
        async with aiofiles.open(local_dest_path, "wb") as out_file:
            while chunk := await file.read(1024 * 64):  # 64KB chunks
                total_size += len(chunk)
                if total_size > settings.max_file_size_bytes:
                    # Clean up partial file
                    await out_file.close()
                    if os.path.exists(local_dest_path):
                        os.remove(local_dest_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB"
                    )
                sha256.update(chunk)
                await out_file.write(chunk)

        content_type = file.content_type or "application/octet-stream"
        file_hash = sha256.hexdigest()

        # Optional: Attempt Supabase Storage Upload
        storage_provider = "local"
        final_path = local_dest_path

        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                async with aiofiles.open(local_dest_path, "rb") as f:
                    file_bytes = await f.read()
                storage_url = await upload_to_supabase_storage(
                    file_bytes,
                    f"{user_id}/{safe_filename}",
                    content_type
                )
                if storage_url:
                    storage_provider = "supabase_storage"
            except Exception:
                pass  # Keep local storage fallback

        # Insert record into PostgreSQL via SQLAlchemy AsyncSession
        db_file = FileModel(
            id=unique_id,
            user_id=user_id,
            filename=safe_filename,
            original_name=file.filename,
            file_path=final_path,
            file_size=total_size,
            content_type=content_type,
            sha256_hash=file_hash,
            storage_provider=storage_provider
        )

        db.add(db_file)
        await db.commit()
        await db.refresh(db_file)
        return db_file

    @staticmethod
    async def get_user_files(
        db: AsyncSession,
        user_id: str,
        offset: int = 0,
        limit: int = 20
    ) -> Tuple[List[FileModel], int]:
        """
        Retrieves paginated files belonging to a specific user.
        """
        # Count total
        count_query = select(func.count(FileModel.id)).where(FileModel.user_id == user_id)
        total_res = await db.execute(count_query)
        total = total_res.scalar() or 0

        # Query items
        query = (
            select(FileModel)
            .where(FileModel.user_id == user_id)
            .order_by(desc(FileModel.created_at))
            .offset(offset)
            .limit(limit)
        )
        result = await db.execute(query)
        items = list(result.scalars().all())
        return items, total

    @staticmethod
    async def get_file_by_id(
        db: AsyncSession,
        file_id: str,
        user_id: Optional[str] = None
    ) -> Optional[FileModel]:
        """
        Fetches single file by ID. Enforces ownership check if user_id is provided.
        """
        query = select(FileModel).where(FileModel.id == file_id)
        if user_id:
            query = query.where(FileModel.user_id == user_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_file(
        db: AsyncSession,
        file_id: str,
        user_id: str
    ) -> bool:
        """
        Deletes file metadata and physical artifact.
        """
        db_file = await FileService.get_file_by_id(db, file_id, user_id)
        if not db_file:
            return False

        # Remove local file if present
        if os.path.exists(db_file.file_path):
            try:
                os.remove(db_file.file_path)
            except Exception:
                pass

        # Remove from Supabase Storage if used
        if db_file.storage_provider == "supabase_storage":
            await delete_from_supabase_storage(f"{user_id}/{db_file.filename}")

        await db.delete(db_file)
        await db.commit()
        return True
