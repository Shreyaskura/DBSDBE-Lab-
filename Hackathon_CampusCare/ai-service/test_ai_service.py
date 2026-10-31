"""
Unit and Integration Tests for CampusCare AI Triage Microservice
Tests NLP classification, priority recommendation, and duplicate detection
"""

import unittest
from fastapi.testclient import TestClient
from main import app
from classifier import nlp_engine

class TestCampusCareAIService(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check(self):
        """Verify the health check endpoint returns 200 and correct metadata."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "UP")
        self.assertIn("Scikit-Learn", data["engine"])
        self.assertEqual(data["service"], "CampusCare AI Microservice")

    def test_classification_electrical(self):
        """Verify electrical keywords correctly classify into Electrical category."""
        response = self.client.post("/ai/classify", json={
            "title": "Sparks coming from socket",
            "description": "Exposed wires and burning switchboard in physics lab"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["category"], "Electrical")
        self.assertGreaterEqual(data["confidence"], 0.70)
        self.assertTrue(len(data["explanation"]) > 0)

    def test_classification_plumbing(self):
        """Verify plumbing keywords correctly classify into Plumbing category."""
        response = self.client.post("/ai/classify", json={
            "title": "Severe water leak flooding hall",
            "description": "Drain pipe burst and water dispenser overflowing continuously"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["category"], "Plumbing")
        self.assertGreaterEqual(data["confidence"], 0.70)

    def test_classification_network(self):
        """Verify Wi-Fi / connectivity keywords correctly classify into Network & Wi-Fi."""
        response = self.client.post("/ai/classify", json={
            "title": "Campus Wi-Fi down in library",
            "description": "Cannot connect to eduroam network, access point blinking red"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["category"], "Network & Wi-Fi")

    def test_classification_classroom_equipment(self):
        """Verify AV / projector keywords correctly classify into Classroom Equipment."""
        response = self.client.post("/ai/classify", json={
            "title": "Overhead digital projector bulb fused",
            "description": "HDMI port broken on teaching podium in lecture hall 101"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["category"], "Classroom Equipment")

    def test_predict_priority_critical(self):
        """Verify dangerous conditions elevate ticket to CRITICAL priority."""
        response = self.client.post("/ai/predict-priority", json={
            "title": "Live electrical wire sparking near classroom doorway",
            "description": "Immediate fire risk, students in danger",
            "category": "Electrical"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["priority"], "CRITICAL")
        self.assertGreaterEqual(data["urgency_score"], 9.0)

    def test_predict_priority_high(self):
        """Verify operational disruptions result in HIGH priority."""
        response = self.client.post("/ai/predict-priority", json={
            "title": "Campus Wi-Fi outage during online exam",
            "description": "Entire exam hall cannot submit final assessment",
            "category": "Network & Wi-Fi"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["priority"], "HIGH")
        self.assertGreaterEqual(data["urgency_score"], 8.0)

    def test_predict_priority_low(self):
        """Verify routine cosmetic complaints result in LOW priority."""
        response = self.client.post("/ai/predict-priority", json={
            "title": "Minor paint scratch on corridor wall",
            "description": "Cosmetic aesthetic request for scheduled maintenance",
            "category": "Infrastructure"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["priority"], "LOW")
        self.assertLessEqual(data["urgency_score"], 4.0)

    def test_duplicate_detection(self):
        """Verify TF-IDF cosine similarity detects duplicate campus issues."""
        candidate = {
            "candidateId": 105,
            "title": "Water dispenser leaking water on 3rd floor corridor",
            "description": "Drinking cooler valve broken pooling on corridor floor",
            "category": "Plumbing",
            "location": "Academic Complex Block B, 3rd Floor East Wing",
            "existing_complaints": [
                {
                    "id": 101,
                    "title": "Broken water dispenser on 3rd floor East Wing",
                    "description": "Water dispenser leaking continuously pooling on corridor floor",
                    "category": "Plumbing",
                    "location": "Academic Complex Block B, 3rd Floor East Wing",
                    "status": "IN_PROGRESS"
                },
                {
                    "id": 102,
                    "title": "Wi-Fi router down in hostel 4",
                    "description": "No internet access in dormitory wing",
                    "category": "Network & Wi-Fi",
                    "location": "Hostel Residence Block 4",
                    "status": "RESOLVED"
                }
            ],
            "similarity_threshold": 0.35
        }
        response = self.client.post("/ai/detect-duplicates", json=candidate)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(data["duplicatesFound"], 1)
        top_match = data["duplicates"][0]
        self.assertEqual(top_match["id"], 101)
        self.assertGreaterEqual(top_match["similarityScore"], 0.40)


if __name__ == "__main__":
    unittest.main()
