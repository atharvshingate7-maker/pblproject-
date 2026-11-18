import asyncio
import math
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from supabase import Client

from app.core.security import get_current_user, AuthUser
from app.db.supabase_client import get_supabase_admin
from app.schemas.case import CaseCreate, CaseRead, CaseUpdate
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/cases", tags=["Cases"])

PRIORITY_TO_RISK = {"low": "low", "medium": "medium", "high": "high", "critical": "critical"}
PRIORITY_TO_SCORE = {"low": 25, "medium": 50, "high": 75, "critical": 92}


def _make_case_id() -> str:
    year = datetime.now(timezone.utc).year
    suffix = str(uuid.uuid4().int)[:3].zfill(3)
    return f"CY-{year}-{suffix}"


@router.get("", response_model=PaginatedResponse[CaseRead], summary="List All Cases (Paginated)")
async def list_cases(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    risk_filter: Optional[str] = Query(default=None, alias="risk"),
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    loop = asyncio.get_event_loop()
    offset = (page - 1) * page_size

    def query():
        q = supabase.table("cases").select("*", count="exact").eq("user_id", str(current_user.id))
        if status_filter and status_filter not in ("All Status", ""):
            q = q.eq("status", status_filter.lower())
        if risk_filter and risk_filter not in ("All Risk Levels", ""):
            q = q.eq("risk", risk_filter.lower())
        if search:
            q = q.or_(f"title.ilike.%{search}%,company.ilike.%{search}%,id.ilike.%{search}%")
        return q.order("created_at", desc=True).range(offset, offset + page_size - 1).execute()

    res = await loop.run_in_executor(None, query)
    items = res.data or []
    total = res.count or 0
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PaginatedResponse[CaseRead](
        items=[CaseRead.model_validate(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("", response_model=CaseRead, status_code=status.HTTP_201_CREATED, summary="Create New Case")
async def create_case(
    payload: CaseCreate,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    loop = asyncio.get_event_loop()
    case_id = _make_case_id()
    risk = PRIORITY_TO_RISK.get(payload.priority, "medium")
    risk_score = PRIORITY_TO_SCORE.get(payload.priority, 50)

    record = {
        "id": case_id,
        "user_id": str(current_user.id),
        "title": payload.title,
        "company": payload.company,
        "type": payload.type,
        "assigned_to": payload.assigned_to,
        "priority": payload.priority,
        "status": "pending",
        "description": payload.description,
        "complainant_name": payload.complainant_name,
        "complainant_contact": payload.complainant_contact,
        "incident_date": payload.incident_date,
        "estimated_loss": payload.estimated_loss,
        "risk": risk,
        "risk_score": risk_score,
        "evidence_count": 0,
        "summary": payload.description[:200] + "…" if len(payload.description) > 200 else payload.description,
    }

    res = await loop.run_in_executor(
        None,
        lambda: supabase.table("cases").insert(record).execute()
    )
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create case")
    return CaseRead.model_validate(res.data[0])


@router.get("/{id}", response_model=CaseRead, summary="Get Case by ID")
async def get_case(
    id: str,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    loop = asyncio.get_event_loop()
    res = await loop.run_in_executor(
        None,
        lambda: supabase.table("cases").select("*").eq("id", id).eq("user_id", str(current_user.id)).maybe_single().execute()
    )
    if not res or not res.data:
        raise HTTPException(status_code=404, detail=f"Case '{id}' not found")
    return CaseRead.model_validate(res.data)


@router.patch("/{id}", response_model=CaseRead, summary="Update Case")
async def update_case(
    id: str,
    payload: CaseUpdate,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    loop = asyncio.get_event_loop()
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    res = await loop.run_in_executor(
        None,
        lambda: supabase.table("cases").update(updates).eq("id", id).eq("user_id", str(current_user.id)).execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail=f"Case '{id}' not found")
    return CaseRead.model_validate(res.data[0])


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Delete Case")
async def delete_case(
    id: str,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: supabase.table("cases").delete().eq("id", id).eq("user_id", str(current_user.id)).execute()
    )
    return {"status": "success", "message": f"Case '{id}' deleted"}
