package com.campuscare.service;

import com.campuscare.dto.*;
import com.campuscare.entity.Complaint;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    @Value("${ai.service.url:http://127.0.0.1:8000}")
    private String aiServiceUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AiService() {
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(3))
                .build();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    /**
     * Calls Python AI service POST /ai/classify
     */
    public AiClassifyResponse classify(String title, String description) {
        try {
            Map<String, String> payload = Map.of(
                    "title", title != null ? title : "",
                    "description", description != null ? description : ""
            );
            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/ai/classify"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(4))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), AiClassifyResponse.class);
            }
        } catch (Exception e) {
            log.warn("AI Service classification unavailable, using fallback: {}", e.getMessage());
        }

        // Rule-based fallback
        return fallbackClassify(title, description);
    }

    /**
     * Calls Python AI service POST /ai/predict-priority
     */
    public AiPriorityResponse predictPriority(String title, String description, String category) {
        try {
            Map<String, String> payload = Map.of(
                    "title", title != null ? title : "",
                    "description", description != null ? description : "",
                    "category", category != null ? category : ""
            );
            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/ai/predict-priority"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(4))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), AiPriorityResponse.class);
            }
        } catch (Exception e) {
            log.warn("AI Service priority prediction unavailable, using fallback: {}", e.getMessage());
        }

        // Rule-based fallback
        return fallbackPriority(title, description, category);
    }

    /**
     * Calls Python AI service POST /ai/detect-duplicates
     */
    public List<DuplicateMatchDto> detectDuplicates(Complaint candidate, List<Complaint> existingComplaints) {
        try {
            List<Map<String, Object>> existingList = new ArrayList<>();
            for (Complaint c : existingComplaints) {
                if (candidate.getId() != null && candidate.getId().equals(c.getId())) {
                    continue;
                }
                Map<String, Object> cMap = new HashMap<>();
                cMap.put("id", c.getId());
                cMap.put("title", c.getTitle() != null ? c.getTitle() : "");
                cMap.put("description", c.getDescription() != null ? c.getDescription() : "");
                cMap.put("location", c.getLocation() != null ? c.getLocation() : "");
                String catName = c.getCategory() != null ? c.getCategory().getCategoryName() : (c.getCategoryName() != null ? c.getCategoryName() : "");
                cMap.put("category", catName);
                cMap.put("status", c.getStatus() != null ? c.getStatus().name() : "");
                existingList.add(cMap);
            }

            String candCat = candidate.getCategory() != null ? candidate.getCategory().getCategoryName() : (candidate.getCategoryName() != null ? candidate.getCategoryName() : "");
            Map<String, Object> payload = new HashMap<>();
            payload.put("candidateId", candidate.getId() != null ? candidate.getId() : 0);
            payload.put("title", candidate.getTitle() != null ? candidate.getTitle() : "");
            payload.put("description", candidate.getDescription() != null ? candidate.getDescription() : "");
            payload.put("category", candCat);
            payload.put("location", candidate.getLocation() != null ? candidate.getLocation() : "");
            payload.put("existing_complaints", existingList);
            payload.put("similarity_threshold", 0.35);

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/ai/detect-duplicates"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(5))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                Map<String, Object> respMap = objectMapper.readValue(response.body(), new TypeReference<>() {});
                Object dupsObj = respMap.get("duplicates");
                if (dupsObj instanceof List) {
                    String dupsJson = objectMapper.writeValueAsString(dupsObj);
                    return objectMapper.readValue(dupsJson, new TypeReference<List<DuplicateMatchDto>>() {});
                }
            }
        } catch (Exception e) {
            log.warn("AI Service duplicate detection unavailable: {}", e.getMessage());
        }

        return Collections.emptyList();
    }

    // ------------------------------------------------------------------------
    // Institutional Fallback Handlers (Active when Python AI Service is down)
    // ------------------------------------------------------------------------

    private AiClassifyResponse fallbackClassify(String title, String description) {
        String combined = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();
        if (combined.contains("light") || combined.contains("electric") || combined.contains("power") || combined.contains("spark") || combined.contains("wire")) {
            return new AiClassifyResponse("Electrical", 0.85, "Rule-based institutional classification: Electrical marker detected.");
        }
        if (combined.contains("pipe") || combined.contains("water") || combined.contains("leak") || combined.contains("toilet") || combined.contains("drain")) {
            return new AiClassifyResponse("Plumbing", 0.85, "Rule-based institutional classification: Plumbing marker detected.");
        }
        if (combined.contains("wifi") || combined.contains("internet") || combined.contains("network") || combined.contains("router")) {
            return new AiClassifyResponse("Network & Wi-Fi", 0.85, "Rule-based institutional classification: Network marker detected.");
        }
        if (combined.contains("projector") || combined.contains("screen") || combined.contains("mic") || combined.contains("speaker")) {
            return new AiClassifyResponse("Classroom Equipment", 0.85, "Rule-based institutional classification: Equipment marker detected.");
        }
        return new AiClassifyResponse("Other", 0.70, "Rule-based institutional classification: General maintenance request.");
    }

    private AiPriorityResponse fallbackPriority(String title, String description, String category) {
        String combined = ((title != null ? title : "") + " " + (description != null ? description : "") + " " + (category != null ? category : "")).toLowerCase();
        if (combined.contains("spark") || combined.contains("fire") || combined.contains("flood") || combined.contains("burst") || combined.contains("stuck")) {
            return new AiPriorityResponse("CRITICAL", 9.5, "Critical safety or infrastructure hazard detected. Immediate dispatch required.");
        }
        if (combined.contains("leak") || combined.contains("down") || combined.contains("no water") || combined.contains("exam") || combined.contains("broken")) {
            return new AiPriorityResponse("HIGH", 8.0, "High severity operational impact. 4-hour SLA standard applies.");
        }
        if (combined.contains("minor") || combined.contains("inquiry") || combined.contains("cosmetic")) {
            return new AiPriorityResponse("LOW", 3.0, "Routine low-urgency maintenance item.");
        }
        return new AiPriorityResponse("MEDIUM", 6.0, "Standard priority campus maintenance service order.");
    }
}
