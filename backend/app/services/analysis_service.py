import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionLocal
from app.db.models import AnalysisJobModel, AnalysisResultModel, FileModel
from app.analysis.adapter import analysis_adapter

logger = logging.getLogger("cyberintel.services.analysis")


class AnalysisService:

    @staticmethod
    async def create_analysis_job(
        db: AsyncSession,
        file: FileModel,
        user_id: str
    ) -> AnalysisJobModel:
        """
        Registers a new analysis job in 'queued' state.
        """
        job = AnalysisJobModel(
            file_id=file.id,
            user_id=user_id,
            status="queued",
            progress=0
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)
        return job

    @staticmethod
    async def execute_analysis_task(job_id: str, file_path: str, filename: str, content_type: str):
        """
        Background task worker executing analysis asynchronously without blocking HTTP request.
        Uses its own isolated database session.
        """
        logger.info(f"Starting background analysis job {job_id} for {filename}")

        async with AsyncSessionLocal() as session:
            try:
                # 1. Update status to 'processing'
                query = select(AnalysisJobModel).where(AnalysisJobModel.id == job_id)
                res = await session.execute(query)
                job = res.scalar_one_or_none()
                if not job:
                    logger.error(f"Job {job_id} not found in background task.")
                    return

                job.status = "processing"
                job.started_at = datetime.now(timezone.utc)
                job.progress = 30
                await session.commit()

                # 2. Execute analysis via adapter (calling user modules or forensic analyzer)
                # Run in executor to prevent CPU-bound analysis from freezing async event loop
                loop = asyncio.get_event_loop()
                analysis_output = await loop.run_in_executor(
                    None,
                    analysis_adapter.run_analysis,
                    file_path,
                    filename,
                    content_type
                )

                job.progress = 85
                await session.commit()

                # 3. Store results
                result_record = AnalysisResultModel(
                    job_id=job.id,
                    file_id=job.file_id,
                    threat_score=analysis_output.get("threat_score", 0),
                    verdict=analysis_output.get("verdict", "inconclusive"),
                    summary=analysis_output.get("summary", "Analysis completed."),
                    indicators=analysis_output.get("indicators", []),
                    raw_output=analysis_output.get("raw_output", {}),
                    mitre_tactics=analysis_output.get("mitre_tactics", [])
                )
                session.add(result_record)

                # 4. Mark job completed
                job.status = "completed"
                job.progress = 100
                job.completed_at = datetime.now(timezone.utc)
                await session.commit()
                logger.info(f"Analysis job {job_id} completed successfully with verdict '{result_record.verdict}'")

            except Exception as e:
                logger.exception(f"Analysis job {job_id} encountered fatal error: {e}")
                await session.rollback()
                # Mark job as failed
                try:
                    res = await session.execute(select(AnalysisJobModel).where(AnalysisJobModel.id == job_id))
                    job = res.scalar_one_or_none()
                    if job:
                        job.status = "failed"
                        job.error_message = str(e)
                        job.completed_at = datetime.now(timezone.utc)
                        await session.commit()
                except Exception as inner_e:
                    logger.error(f"Failed to record error state for job {job_id}: {inner_e}")

    @staticmethod
    async def get_job_by_id(
        db: AsyncSession,
        job_id: str,
        user_id: Optional[str] = None
    ) -> Optional[AnalysisJobModel]:
        """
        Fetches analysis job and eagerly loads its associated result.
        """
        query = (
            select(AnalysisJobModel)
            .options(selectinload(AnalysisJobModel.result))
            .where(AnalysisJobModel.id == job_id)
        )
        if user_id:
            query = query.where(AnalysisJobModel.user_id == user_id)

        result = await db.execute(query)
        return result.scalar_one_or_none()
