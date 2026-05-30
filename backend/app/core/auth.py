"""Logto JWT middleware — validates Bearer tokens when LOGTO_ISSUER is configured.

When LOGTO_ISSUER is empty the middleware is a no-op so local dev works without
any auth configuration.
"""
import httpx
from jose import JWTError, jwt
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

_bearer = HTTPBearer(auto_error=False)
_jwks_cache: dict = {}


async def _fetch_jwks(issuer: str) -> dict:
    if issuer not in _jwks_cache:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{issuer.rstrip('/')}/.well-known/jwks.json")
            resp.raise_for_status()
            _jwks_cache[issuer] = resp.json()
    return _jwks_cache[issuer]


async def require_auth(request: Request) -> dict:
    """FastAPI dependency — returns decoded JWT claims or raises 401."""
    if not settings.logto_issuer:
        return {}

    credentials: HTTPAuthorizationCredentials | None = await _bearer(request)
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        jwks = await _fetch_jwks(settings.logto_issuer)
        claims = jwt.decode(
            credentials.credentials,
            jwks,
            algorithms=["RS256"],
            audience=settings.logto_audience,
            issuer=settings.logto_issuer,
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    return claims
