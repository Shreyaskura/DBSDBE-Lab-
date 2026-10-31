package com.campuscare.service;

import com.campuscare.dto.AiClassifyResponse;
import com.campuscare.dto.AiPriorityResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AiServiceTest {

    private AiService aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiService();
    }

    @Test
    @DisplayName("Should use institutional rule-based fallback when AI service is unreachable for classification")
    void testFallbackClassification() {
        // Points to unreachable port to exercise fallback logic
        AiClassifyResponse electricalResp = aiService.classify("Power tripped in lab", "Sparks coming from socket");
        assertNotNull(electricalResp);
        assertEquals("Electrical", electricalResp.getCategory());
        assertTrue(electricalResp.getExplanation().contains("Rule-based institutional classification"));

        AiClassifyResponse plumbingResp = aiService.classify("Water dispenser leak", "Pipe drain clogged and water flooding");
        assertNotNull(plumbingResp);
        assertEquals("Plumbing", plumbingResp.getCategory());

        AiClassifyResponse wifiResp = aiService.classify("No wifi signal", "Internet router down in hostel");
        assertNotNull(wifiResp);
        assertEquals("Network & Wi-Fi", wifiResp.getCategory());

        AiClassifyResponse equipmentResp = aiService.classify("Projector broken", "Screen not turning on in seminar hall");
        assertNotNull(equipmentResp);
        assertEquals("Classroom Equipment", equipmentResp.getCategory());
    }

    @Test
    @DisplayName("Should infer CRITICAL priority for life safety / fire / severe hazard fallbacks")
    void testFallbackCriticalPriority() {
        AiPriorityResponse resp = aiService.predictPriority("Fire in lab", "Live wire exploded sparking", "Electrical");
        assertNotNull(resp);
        assertEquals("CRITICAL", resp.getPriority());
        assertEquals(9.5, resp.getUrgencyScore());
    }

    @Test
    @DisplayName("Should infer HIGH priority for operational outage fallbacks")
    void testFallbackHighPriority() {
        AiPriorityResponse resp = aiService.predictPriority("Wi-Fi down", "No water in dorm during exam week", "Plumbing");
        assertNotNull(resp);
        assertEquals("HIGH", resp.getPriority());
        assertEquals(8.0, resp.getUrgencyScore());
    }

    @Test
    @DisplayName("Should infer LOW priority for routine minor cosmetic items")
    void testFallbackLowPriority() {
        AiPriorityResponse resp = aiService.predictPriority("Minor cosmetic scratch", "Wall paint faded inquiry", "Infrastructure");
        assertNotNull(resp);
        assertEquals("LOW", resp.getPriority());
        assertEquals(3.0, resp.getUrgencyScore());
    }
}
