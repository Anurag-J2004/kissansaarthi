import os
import redis
import json

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Simple sync redis client for MVP
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def get_cache(key: str):
    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception:
        pass
    return None

def set_cache(key: str, value: dict, expire_seconds: int = 3600):
    try:
        redis_client.setex(key, expire_seconds, json.dumps(value))
    except Exception:
        pass
