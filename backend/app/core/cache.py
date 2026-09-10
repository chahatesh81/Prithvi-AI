import json
import logging
from typing import Optional, Any
import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger("sih-backend.cache")


class CacheManager:
    def __init__(self):
        self._redis: Optional[redis.Redis] = None

    async def init_redis(self):
        try:
            self._redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
            await self._redis.ping()
            logger.info("Successfully connected to Redis cache.")
        except Exception as e:
            logger.warning(f"Redis unavailable, running in memory-only fallback cache mode: {e}")
            self._redis = None

    async def close(self):
        if self._redis:
            await self._redis.close()

    async def get(self, key: str) -> Optional[Any]:
        if not self._redis:
            return None
        try:
            data = await self._redis.get(key)
            if data:
                return json.loads(data)
        except Exception as e:
            logger.warning(f"Cache read error for key {key}: {e}")
        return None

    async def set(self, key: str, value: Any, ttl_seconds: int = 300) -> bool:
        if not self._redis:
            return False
        try:
            serialized = json.dumps(value)
            await self._redis.set(key, serialized, ex=ttl_seconds)
            return True
        except Exception as e:
            logger.warning(f"Cache write error for key {key}: {e}")
            return False


cache_manager = CacheManager()
