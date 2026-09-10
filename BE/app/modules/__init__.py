"""Each thing you learn lives in its own module package here.

To add a module (e.g. "rag"):
1. Copy the "example_module" folder and rename it (e.g. "rag").
2. Write your endpoints in its router.py.
3. Register it in app/main.py:
       from app.modules.rag.router import router as rag_router
       app.include_router(rag_router, prefix="/rag")
"""
