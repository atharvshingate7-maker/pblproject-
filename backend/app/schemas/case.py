from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, date


class CaseCreate(BaseModel):
    title: str
    company: str
    type: str
    assigned_to: str = "Atharv Shingate"
    priority: str = "medium"
    description: str
    complainant_name: Optional[str] = None
    complainant_contact: Optional[str] = None
    incident_date: Optional[str] = None
    estimated_loss: Optional[str] = None


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    risk: Optional[str] = None
    risk_score: Optional[int] = None
    summary: Optional[str] = None
    evidence_count: Optional[int] = None


class CaseRead(BaseModel):
    id: str
    user_id: str
    title: str
    company: str
    type: str
    assigned_to: str
    priority: str
    status: str
    description: str
    complainant_name: Optional[str] = None
    complainant_contact: Optional[str] = None
    incident_date: Optional[str] = None
    estimated_loss: Optional[str] = None
    risk: str = "medium"
    risk_score: int = 50
    evidence_count: int = 0
    summary: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = {"from_attributes": True}
