import logging
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("cyberintel.db.supabase")

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Returns a configured Supabase client instance using SUPABASE_URL and SUPABASE_KEY.
    Returns None if credentials are not configured yet, allowing local mock/fallback operations.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.warning("SUPABASE_URL or SUPABASE_KEY not configured. Running in local fallback mode.")
        return None

    try:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized successfully.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None


async def upload_to_supabase_storage(file_bytes: bytes, destination_path: str, content_type: str) -> Optional[str]:
    """
    Uploads a file to the configured Supabase Storage bucket.
    Returns the public/storage URL if successful, or None to fall back to local disk storage.
    """
    client = get_supabase_client()
    if not client:
        return None

    try:
        client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
            path=destination_path,
            file=file_bytes,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        url_info = client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).get_public_url(destination_path)
        return url_info
    except Exception as e:
        logger.warning(f"Supabase storage upload failed ({e}). Falling back to local storage.")
        return None


async def delete_from_supabase_storage(file_path: str) -> bool:
    """
    Deletes an object from the Supabase Storage bucket.
    """
    client = get_supabase_client()
    if not client:
        return False

    try:
        client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).remove([file_path])
        return True
    except Exception as e:
        logger.error(f"Supabase storage deletion error for {file_path}: {e}")
        return False
