from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status

from app.core.security import get_current_user, AuthUser
from app.services.file_service import FileService
from app.services.analysis_service import AnalysisService
from app.schemas.analysis import AnalysisJobRead, AnalysisTriggerResponse
from app.db.supabase_client import get_supabase_admin
from supabase import Client

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/{file_id}", response_model=AnalysisTriggerResponse, status_code=status.HTTP_202_ACCEPTED, summary="Trigger File Analysis")
async def trigger_analysis(
    file_id: str,
    background_tasks: BackgroundTasks,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Initiates async forensic analysis. Returns 202 Accepted immediately.
    """
    db_file = await FileService.get_file_by_id(supabase=supabase, file_id=file_id, user_id=current_user.id)
    if not db_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"File '{file_id}' not found or access denied")

    job = await AnalysisService.create_analysis_job(
        supabase=supabase,
        file=db_file,
        user_id=current_user.id
    )

    background_tasks.add_task(
        AnalysisService.execute_analysis_task,
        job_id=job["id"],
        file_path=db_file.get("file_path", ""),
        filename=db_file.get("original_name", ""),
        content_type=db_file.get("content_type", "")
    )

    return AnalysisTriggerResponse(
        status="success",
        message="Analysis job queued successfully",
        job_id=job["id"],
        file_id=db_file["id"],
        initial_status="queued"
    )


@router.get("/{id}", response_model=AnalysisJobRead, summary="Get Analysis Job Status & Result")
async def get_analysis_status(
    id: str,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    job = await AnalysisService.get_job_by_id(supabase=supabase, job_id=id, user_id=current_user.id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Analysis job '{id}' not found")
    return AnalysisJobRead.model_validate(job)
