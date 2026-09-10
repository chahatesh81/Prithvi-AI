from typing import Any, Optional, Dict
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse


class SIHException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(status_code=status_code, detail=message, headers=headers)
        self.code = code
        self.message = message
        self.details = details


class NotFoundException(SIHException):
    def __init__(self, resource: str = "Resource", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=f"{resource} not found",
            details=details
        )


class ValidationException(SIHException):
    def __init__(self, message: str = "Validation error", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message=message,
            details=details
        )


class UnauthorizedException(SIHException):
    def __init__(self, message: str = "Authentication credentials required"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ServiceUnavailableException(SIHException):
    def __init__(self, service: str = "External Service", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="SERVICE_UNAVAILABLE",
            message=f"{service} is currently unavailable",
            details=details
        )


def create_error_response(
    status_code: int,
    code: str,
    message: str,
    details: Optional[Any] = None,
    request_id: Optional[str] = None
) -> JSONResponse:
    content = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details
        },
        "request_id": request_id
    }
    return JSONResponse(status_code=status_code, content=content)
