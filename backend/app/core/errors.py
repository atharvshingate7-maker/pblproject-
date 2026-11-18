from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Format HTTP exceptions in a clean, Axios-friendly JSON envelope.
    Frontend Axios catches: error.response.data.detail
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": request.url.path,
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Formats Pydantic validation errors into clean messages for frontend display.
    """
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        msg = err.get("msg", "Validation error")
        errors.append(f"{field}: {msg}" if field else msg)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "validation_error",
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "detail": "; ".join(errors) if errors else "Request validation failed",
            "errors": exc.errors(),
            "path": request.url.path,
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all for internal server exceptions.
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "internal_error",
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "detail": str(exc) if True else "An unexpected server error occurred",
            "path": request.url.path,
        },
    )
