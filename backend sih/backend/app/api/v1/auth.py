from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.models import User
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.schemas.common import APIResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import SIHException, UnauthorizedException
from sqlalchemy import select

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise SIHException(status_code=400, code="EMAIL_EXISTS", message="User with this email already exists")

    new_user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role or "user"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return APIResponse(data=UserResponse.model_validate(new_user))


@router.post("/login", response_model=APIResponse[Token])
async def login(login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == login_in.email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not verify_password(login_in.password, user.password_hash):
        raise UnauthorizedException("Invalid email or password")

    access_token = create_access_token(subject=user.id, role=user.role)
    user_resp = UserResponse.model_validate(user)

    return APIResponse(
        data=Token(
            access_token=access_token,
            expires_in=28800,
            user=user_resp
        )
    )
