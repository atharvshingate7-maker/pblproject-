import math
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user, AuthUser
from app.services.file_service import FileService
from app.schemas.file import FileRead, FileUploadResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/files", tags=["Files"])


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED, summary="Upload File Artifact")
async def upload_file(
    file: UploadFile = File(...),
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Accepts multipart file upload, validates extension & size, computes cryptographic SHA-256 hash,
    persists artifact to storage, and records entry in database.
    """
    db_file = await FileService.process_and_store_upload(
        file=file,
        user_id=current_user.id,
        db=db
    )
    return FileUploadResponse(
        status="success",
        message="File uploaded and verified successfully",
        file=FileRead.model_validate(db_file)
    )


@router.get("", response_model=PaginatedResponse[FileRead], summary="List User Files (Paginated)")
async def list_files(
    page: int = Query(default=1, ge=1, description="Page number starting at 1"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns paginated list of files belonging to the authenticated user.
    """
    offset = (page - 1) * page_size
    items, total = await FileService.get_user_files(
        db=db,
        user_id=current_user.id,
        offset=offset,
        limit=page_size
    )

    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PaginatedResponse[FileRead](
        items=[FileRead.model_validate(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{id}", response_model=FileRead, summary="Get File Details by ID")
async def get_file(
    id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves metadata for a specific file belonging to the authenticated user.
    """
    db_file = await FileService.get_file_by_id(db=db, file_id=id, user_id=current_user.id)
    if not db_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with ID '{id}' was not found"
        )
    return FileRead.model_validate(db_file)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Delete File Artifact")
async def delete_file(
    id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Deletes the file metadata and associated physical artifact from disk / storage.
    """
    success = await FileService.delete_file(db=db, file_id=id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with ID '{id}' was not found or access was denied"
        )
    return {
        "status": "success",
        "message": f"File '{id}' deleted successfully"
    }
