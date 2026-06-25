from __future__ import annotations

import uuid
from datetime import datetime, timezone


def generate_ticket_id() -> str:
    short_uuid = uuid.uuid4().hex[:6].upper()
    now = datetime.now(timezone.utc)
    return f"TKT-{now.year}-{short_uuid}"


def generate_transaction_id() -> str:
    short_uuid = uuid.uuid4().hex[:8].upper()
    now = datetime.now(timezone.utc)
    return f"TXN-{now.year}-{short_uuid}"


def calculate_duration_minutes(entry_time: datetime, exit_time: datetime | None = None) -> int:
    end = exit_time if exit_time is not None else datetime.now(timezone.utc)
    if entry_time.tzinfo is None:
        entry_time = entry_time.replace(tzinfo=timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)
    delta = end - entry_time
    return max(0, int(delta.total_seconds() // 60))

