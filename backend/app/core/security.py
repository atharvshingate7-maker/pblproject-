import logging
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

from app.core.config import get_settings, Settings
from app.db.supabase_client import get_supabase, get_user_supabase_client

logger = logging.getLogger("cyberintel.core.security")

security_scheme = HTTPBearer(auto_error=False)


class AuthUser:
    """Represents the authenticated Supabase user."""
    def __init__(self, id: str, email: Optional[str] = None, role: str = "authenticated", metadata: Optional[Dict[str, Any]] = None):
        self.id = id
        self.email = email
        self.role = role
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "metadata": self.metadata
        }


async def get_bearer_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> str:
    """Extracts raw JWT bearer token from the Authorization header."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization: Bearer <token> header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials


async def get_current_user(
    token: str = Depends(get_bearer_token),
    supabase: Client = Depends(get_supabase)
) -> AuthUser:
    """
    Verifies Supabase JWT token via Supabase Auth service.
    Returns 401 JSON error for invalid or expired tokens.
    """
    try:
        # Validate token directly against Supabase Auth API
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        u = user_response.user
        return AuthUser(
            id=str(u.id),
            email=u.email,
            role=u.role or "authenticated",
            metadata=u.user_metadata or {}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Supabase token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_authenticated_supabase(
    token: str = Depends(get_bearer_token),
    settings: Settings = Depends(get_settings)
) -> Client:
    """
    FastAPI dependency: Returns a Supabase client scoped to the authenticated user's token.
    All PostgREST select/insert/update/delete operations execute with auth.uid() matching the user,
    strictly enforcing Supabase Row Level Security (RLS) policies.
    """
    return get_user_supabase_client(token, settings)
