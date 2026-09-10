"""Template router for a learning module. Copy this folder to start a new one.

Delete the sample endpoint below and add your own as you learn.
"""

from fastapi import APIRouter

router = APIRouter(tags=["example"])


@router.get("/ping")
def ping():
    return {"module": "example", "message": "replace me"}
