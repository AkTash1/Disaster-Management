"""
Master API v1 Router aggregating all domain sub-routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    tables,
    overview,
    map_explorer,
    events,
    modality_events,
    event_groups,
    reports,
    history,
    preparedness,
    ask,
    my_area,
)

api_router = APIRouter()

api_router.include_router(tables.router, prefix="/tables", tags=["Tables & Schema Inspection"])
api_router.include_router(overview.router, prefix="/overview", tags=["View 1: Overview"])
api_router.include_router(map_explorer.router, prefix="/map", tags=["View 2: Map Explorer"])
api_router.include_router(events.router, prefix="/events", tags=["View 3: Unified Events"])
api_router.include_router(modality_events.router, prefix="/modality-events", tags=["View 4: Modality Events"])
api_router.include_router(event_groups.router, prefix="/event-groups", tags=["View 5: Event Groups / Episodes"])
api_router.include_router(reports.router, prefix="/reports", tags=["View 6: Reports & Evidence"])
api_router.include_router(history.router, prefix="/history", tags=["View 7: History & Trends"])
api_router.include_router(preparedness.router, prefix="/preparedness", tags=["View 8: Preparedness & Response"])
api_router.include_router(ask.router, prefix="/ask", tags=["View 9: Ask (Evidence-Grounded Q&A)"])
api_router.include_router(my_area.router, prefix="/my-area", tags=["View 10: My Area & Settings"])
