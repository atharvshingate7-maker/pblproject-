import logging
from typing import Optional
from fastapi import HTTPException, status, Depends
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
from app.core.config import get_settings, Settings

logger = logging.getLogger("cyberintel.db.supabase_client")

_public_client: Optional[Client] = None
_admin_client: Optional[Client] = None


def get_clean_url(url: str) -> str:
    """Ensure trailing slashes and /rest/v1 are stripped."""
    clean = url.strip()
    if clean.endswith("/rest/v1/"):
        clean = clean[:-9]
    elif clean.endswith("/rest/v1"):
        clean = clean[:-8]
    return clean.rstrip("/")


def create_public_supabase_client(cfg: Optional[Settings] = None) -> Client:
    """
    Initializes public Supabase client using the publishable (anon) key.
    Used for public or user-scoped calls that enforce Row Level Security (RLS).
    """
    settings = cfg or get_settings()
    url = get_clean_url(settings.SUPABASE_URL)
    key = settings.SUPABASE_PUBLISHABLE_KEY

    if not url or not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be configured in environment."
        )

    return create_client(url, key)


def create_admin_supabase_client(cfg: Optional[Settings] = None) -> Client:
    """
    Initializes admin Supabase client using the secret key (service role).
    Bypasses RLS for backend-only operations (storage administration, background worker jobs).
    """
    settings = cfg or get_settings()
    url = get_clean_url(settings.SUPABASE_URL)
    key = settings.SUPABASE_SECRET_KEY

    if not url or not key or key == "your_secret_key_here":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_SECRET_KEY must be configured in .env for admin operations."
        )

    return create_client(url, key)


def get_user_supabase_client(token: str, cfg: Optional[Settings] = None) -> Client:
    """
    Creates a user-scoped Supabase client that carries the user's JWT in headers,
    ensuring all database queries strictly evaluate Row Level Security (RLS) policies
    against auth.uid() = user's id.
    """
    settings = cfg or get_settings()
    url = get_clean_url(settings.SUPABASE_URL)
    key = settings.SUPABASE_PUBLISHABLE_KEY

    options = ClientOptions(headers={"Authorization": f"Bearer {token}"})
    client = create_client(url, key, options=options)
    client.postgrest.auth(token)
    return client


# ─── FastAPI Dependencies ─────────────────────────────────────────────

def get_supabase(settings: Settings = Depends(get_settings)) -> Client:
    """
    FastAPI dependency: Injects the public Supabase client (anon key).
    """
    global _public_client
    if _public_client is None:
        _public_client = create_public_supabase_client(settings)
    return _public_client


def get_supabase_admin(settings: Settings = Depends(get_settings)) -> Client:
    """
    FastAPI dependency: Injects the admin Supabase client (secret key).
    """
    global _admin_client
    if _admin_client is None:
        _admin_client = create_admin_supabase_client(settings)
    return _admin_client
