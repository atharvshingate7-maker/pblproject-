from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class IndicatorItem(BaseModel):
    type: str  # e.g., 'c2_ip', 'sha256_mismatch', 'entropy_spike', 'exfil_uri'
    value: str
    severity: str = "medium"  # 'low', 'medium', 'high', 'critical'
    description: Optional[str] = None


class AnalysisResultRead(BaseModel):
    id: str
    job_id: str
    file_id: str
    threat_score: int = Field(ge=0, le=100)
    verdict: str
    summary: str
    indicators: List[Dict[str, Any]] = []
    raw_output: Dict[str, Any] = {}
    mitre_tactics: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisJobRead(BaseModel):
    id: str
    file_id: str
    user_id: str
    status: str
    progress: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    result: Optional[AnalysisResultRead] = None

    class Config:
        from_attributes = True


class AnalysisTriggerResponse(BaseModel):
    status: str = "success"
    message: str = "Analysis job queued successfully"
    job_id: str
    file_id: str
    initial_status: str = "queued"
