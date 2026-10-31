"""
CampusCare AI Microservice
FastAPI REST Interface for Intelligent Campus Service Request Triage
"""

from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from classifier import nlp_engine

app = FastAPI(
    title="CampusCare AI Triage Microservice",
    description="Machine Learning service providing NLP category classification, priority inference, and duplicate detection for campus maintenance tickets.",
    version="1.0.0"
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# Enable CORS for internal microservice communication and dashboard inspection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print("VALIDATION ERROR DETAILS:", exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors()})



# ============================================================================
# Pydantic Request & Response Schemas
# ============================================================================

class ClassifyRequest(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""

class ClassifyResponse(BaseModel):
    category: str
    confidence: float
    explanation: str

class PriorityRequest(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    category: Optional[str] = ""

class PriorityResponse(BaseModel):
    priority: str
    urgency_score: float
    explanation: str

class DuplicateCheckRequest(BaseModel):
    candidateId: Optional[Any] = None
    title: Optional[str] = ""
    description: Optional[str] = ""
    category: Optional[str] = ""
    location: Optional[str] = ""
    existing_complaints: Optional[List[Dict[str, Any]]] = []
    similarity_threshold: Optional[float] = 0.35

class DuplicateMatch(BaseModel):
    id: Any
    title: str
    category: Optional[str] = ""
    location: Optional[str] = ""
    status: Optional[str] = ""
    similarityScore: float
    confidencePercentage: str
    reason: str

class DuplicateCheckResponse(BaseModel):
    candidateTitle: str
    duplicatesFound: int
    duplicates: List[DuplicateMatch]


# ============================================================================
# REST Endpoints
# ============================================================================

@app.get("/health", tags=["System"])
def health_check():
    """Service health and model metadata check."""
    return {
        "status": "UP",
        "service": "CampusCare AI Microservice",
        "engine": "Scikit-Learn TF-IDF + MultinomialNB",
        "version": "1.0.0"
    }


@app.post("/ai/classify", response_model=ClassifyResponse, tags=["AI Triage"])
def classify_complaint(request: ClassifyRequest):
    """
    Classifies student complaint text into the most probable maintenance category.
    """
    combined_text = f"{request.title} {request.description}".strip()
    result = nlp_engine.classify(combined_text)
    return ClassifyResponse(
        category=result["category"],
        confidence=result["confidence"],
        explanation=result["explanation"]
    )


@app.post("/ai/predict-priority", response_model=PriorityResponse, tags=["AI Triage"])
def predict_priority(request: PriorityRequest):
    """
    Infers priority recommendation (LOW, MEDIUM, HIGH, CRITICAL) based on
    safety hazards, disruption markers, and institutional impact.
    """
    result = nlp_engine.predict_priority(
        title=request.title or "",
        description=request.description,
        category=request.category or ""
    )
    return PriorityResponse(
        priority=result["priority"],
        urgency_score=result["urgency_score"],
        explanation=result["explanation"]
    )


@app.post("/ai/detect-duplicates", response_model=DuplicateCheckResponse, tags=["AI Triage"])
def detect_duplicates(request: DuplicateCheckRequest):
    """
    Identifies potential duplicate or correlated campus complaints using TF-IDF
    cosine similarity across issue descriptions and location heuristics.
    """
    raw_list = request.existing_complaints or []
    filtered_existing = [
        c for c in raw_list
        if str(c.get("id")) != str(request.candidateId)
    ]

    matches = nlp_engine.detect_duplicates(
        candidate_title=request.title or "",
        candidate_description=request.description or "",
        candidate_category=request.category or "",
        candidate_location=request.location or "",
        existing_complaints=filtered_existing,
        similarity_threshold=request.similarity_threshold or 0.35
    )

    duplicate_objects = [DuplicateMatch(**m) for m in matches]

    return DuplicateCheckResponse(
        candidateTitle=request.title or "",
        duplicatesFound=len(duplicate_objects),
        duplicates=duplicate_objects
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
