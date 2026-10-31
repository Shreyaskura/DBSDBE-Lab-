# CampusCare - AI Service (FastAPI)

## Architecture Overview
This module handles intelligent triage, sentiment detection, automated classification, and priority scoring for campus service requests.

## Planned Technology Stack
- **Framework:** Python 3.11+ / FastAPI
- **Model Layer:** HuggingFace Transformers / LangChain / OpenAI or local LLM inference
- **Data Serialization:** Pydantic v2
- **Server:** Uvicorn ASGI

## Core AI Capabilities
- **Automated Ticket Categorization:** Maps free-form student issues to relevant department (IT, Facilities, Hostels, Academics).
- **Urgency & Severity Detection:** Identifies campus safety and infrastructure risks in real-time.
- **Duplicate Request Deduplication:** Semantic similarity checking for campus-wide incidents (e.g., Wi-Fi outage).
- **Smart Resolution Recommendations:** Suggests troubleshooting guides to technicians.
