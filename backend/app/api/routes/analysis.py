from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user, AuthUser
from app.services.file_service import FileService
from app.services.analysis_service import AnalysisService
from app.schemas.analysis import AnalysisJobRead, AnalysisTriggerResponse

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/{file_id}", response_model=AnalysisTriggerResponse, status_code=status.HTTP_202_ACCEPTED, summary="Trigger File Analysis (Background Task)")
async def trigger_analysis(
    file_id: str,
    background_tasks: BackgroundTasks,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Initiates asynchronous forensic/ML file analysis.
    Queues a background worker task so HTTP requests return immediately with 202 Accepted.
    """
    # 1. Verify file exists and belongs to user
    db_file = await FileService.get_file_by_id(db=db, file_id=file_id, user_id=current_user.id)
    if not db_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with ID '{file_id}' not found or access denied"
        )

    # 2. Register queued job in DB
    job = await AnalysisService.create_analysis_job(
        db=db,
        file=db_file,
        user_id=current_user.id
    )

    # 3. Dispatch to background executor
    background_tasks.add_task(
        AnalysisService.execute_analysis_task,
        job_id=job.id,
        file_path=db_file.file_path,
        filename=db_file.original_name,
        content_type=db_file.content_type
    )

    return AnalysisTriggerResponse(
        status="success",
        message="Analysis job queued successfully",
        job_id=job.id,
        file_id=db_file.id,
        initial_status="queued"
    )


@router.get("/{id}", response_model=AnalysisJobRead, summary="Get Analysis Job Status & Result")
async def get_analysis_status(
    id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the real-time status (queued, processing, completed, failed), progress %,
    and upon completion, the full structured result (threat score, verdict, indicators, raw output).
    """
    job = await AnalysisService.get_job_by_id(db=db, job_id=id, user_id=current_user.id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job with ID '{id}' was not found"
        )
    return AnalysisJobRead.model_validate(job)
