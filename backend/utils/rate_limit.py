# utils/rate_limit.py
#
# Minimal in-memory sliding-window rate limiter.
#
# Deliberately dependency-free and per-process: this app runs as a single
# Flask process serving one kitchen. If it is ever run with multiple workers,
# move this to a shared backend (Redis / flask-limiter); per-process counters
# would otherwise hand each worker its own quota.
#
# Client identity is `request.remote_addr`. Behind a reverse proxy that is the
# proxy's address, so wrap the app in werkzeug's ProxyFix at deploy time
# rather than trusting X-Forwarded-For here (that header is caller-supplied
# and trivially spoofed).
#
import functools
import threading
import time
from collections import defaultdict, deque

from flask import jsonify, request

_PRUNE_EVERY_SECONDS = 300


class RateLimiter:
    def __init__(self):
        self._hits = defaultdict(deque)
        self._lock = threading.Lock()
        self._last_prune = time.monotonic()

    def check(self, key, limit, window_seconds):
        """Record a hit for `key`; return False if it exceeds the window."""
        now = time.monotonic()
        with self._lock:
            self._prune(now)
            hits = self._hits[key]
            cutoff = now - window_seconds
            while hits and hits[0] < cutoff:
                hits.popleft()
            if len(hits) >= limit:
                return False
            hits.append(now)
            return True

    def reset(self):
        """Drop all counters (used by tests)."""
        with self._lock:
            self._hits.clear()

    def _prune(self, now):
        """Drop keys with no recent hits so the dict can't grow forever."""
        if now - self._last_prune < _PRUNE_EVERY_SECONDS:
            return
        self._last_prune = now
        stale = [k for k, hits in self._hits.items()
                 if not hits or hits[-1] < now - _PRUNE_EVERY_SECONDS]
        for k in stale:
            del self._hits[k]


limiter = RateLimiter()


def rate_limit(limit, window_seconds, scope, message=None):
    """
    Reject callers who exceed `limit` requests per `window_seconds`.

    Returns 429 with a plain error body; the frontend surfaces it the same
    way as any other 4xx from the API.
    """
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            key = f"{scope}:{request.remote_addr or 'unknown'}"
            if not limiter.check(key, limit, window_seconds):
                return jsonify(
                    error=message or "Too many requests. Please wait a moment."
                ), 429
            return fn(*args, **kwargs)
        return wrapper
    return decorator
