import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from supabase import Client

from app.db.supabase_client import get_supabase_admin
from app.analysis.adapter import analysis_adapter

logger = logging.getLogger("cyberintel.services.analysis")


class AnalysisService:

    @staticmethod
    async def create_analysis_job(
        supabase: Client,
        file: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        record = {
            "file_id": file["id"],
            "user_id": user_id,
            "status": "queued",
            "progress": 0
        }
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(
            None,
            lambda: supabase.table("analysis_jobs").insert(record).execute()
        )
        return res.data[0] if res.data else record

    @staticmethod
    async def execute_analysis_task(job_id: str, file_path: str, filename: str, content_type: str):
        """
        Background task: runs analysis and writes results to Supabase.
        Uses its own admin client since it runs outside the request context.
        """
        logger.info(f"Starting background analysis job {job_id} for {filename}")
        supabase = get_supabase_admin()
        loop = asyncio.get_event_loop()

        def sb_update(data):
            return supabase.table("analysis_jobs").update(data).eq("id", job_id).execute()

        try:
            # Mark as processing
            await loop.run_in_executor(None, lambda: sb_update({
                "status": "processing",
                "progress": 30,
                "started_at": datetime.now(timezone.utc).isoformat()
            }))

            # Run analysis in thread executor (CPU-bound)
            analysis_output = await loop.run_in_executor(
                None,
                analysis_adapter.run_analysis,
                file_path, filename, content_type
            )

            # Update progress
            await loop.run_in_executor(None, lambda: sb_update({"progress": 85}))

            # Insert result
            await loop.run_in_executor(None, lambda: supabase.table("analysis_results").insert({
                "job_id": job_id,
                "file_id": analysis_output.get("file_id", ""),
                "threat_score": analysis_output.get("threat_score", 0),
                "verdict": analysis_output.get("verdict", "inconclusive"),
                "summary": analysis_output.get("summary", "Analysis completed."),
                "indicators": analysis_output.get("indicators", []),
                "raw_output": analysis_output.get("raw_output", {}),
                "mitre_tactics": analysis_output.get("mitre_tactics", [])
            }).execute())

            # Mark completed
            await loop.run_in_executor(None, lambda: sb_update({
                "status": "completed",
                "progress": 100,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }))
            logger.info(f"Analysis job {job_id} completed: {analysis_output.get('verdict')}")

        except Exception as e:
            logger.exception(f"Analysis job {job_id} failed: {e}")
            try:
                await loop.run_in_executor(None, lambda: sb_update({
                    "status": "failed",
                    "error_message": str(e),
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }))
            except Exception as inner:
                logger.error(f"Could not record failure for job {job_id}: {inner}")

    @staticmethod
    async def get_job_by_id(
        supabase: Client,
        job_id: str,
        user_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        loop = asyncio.get_event_loop()

        def query():
            q = supabase.table("analysis_jobs").select("*, analysis_results(*)").eq("id", job_id)
            if user_id:
                q = q.eq("user_id", user_id)
            return q.maybe_single().execute()

        res = await loop.run_in_executor(None, query)
        return res.data if res else None
