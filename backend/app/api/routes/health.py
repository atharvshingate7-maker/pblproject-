import time
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.core.config import get_settings, Settings
from app.db.supabase_client import get_supabase, get_supabase_admin
from app.schemas.common import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])

START_TIME = time.time()


@router.get("", response_model=HealthResponse, summary="General Backend Health Status")
async def check_general_health(settings: Settings = Depends(get_settings)):
    """Returns general backend uptime and environment info."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        database="supabase",
        environment=settings.ENV,
        uptime_seconds=round(time.time() - START_TIME, 2)
    )


@router.get("/supabase", summary="Supabase Connection Verification")
async def check_supabase_connection(
    settings: Settings = Depends(get_settings),
    supabase: Client = Depends(get_supabase)
):
    """
    Checks Supabase connectivity by issuing a query via supabase-py.
    Returns { "success": true, "data": { "supabase": "connected" } }.
    """
    try:
        # Simple probe query on the profiles table or metadata
        res = supabase.table("profiles").select("id").limit(1).execute()
        return {
            "success": True,
            "data": {
                "supabase": "connected",
                "project_url": settings.SUPABASE_URL,
                "storage_bucket": settings.SUPABASE_STORAGE_BUCKET
            }
        }
    except Exception as e:
        err_msg = str(e)
        # Even if the table is empty or just created, check if PostgREST responded
        if "relation \"public.profiles\" does not exist" in err_msg.lower():
            return {
                "success": True,
                "data": {
                    "supabase": "connected (database reached, but tables not yet created. Run schema.sql in Supabase SQL editor)",
                    "project_url": settings.SUPABASE_URL
                }
            }
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error": f"Supabase connection test failed: {err_msg}",
                "project_url": settings.SUPABASE_URL
            }
        )
