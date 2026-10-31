package com.campuscare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AiPriorityResponse {
    private String priority;

    @JsonProperty("urgency_score")
    private double urgencyScore;

    private String explanation;

    public AiPriorityResponse() {}

    public AiPriorityResponse(String priority, double urgencyScore, String explanation) {
        this.priority = priority;
        this.urgencyScore = urgencyScore;
        this.explanation = explanation;
    }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public double getUrgencyScore() { return urgencyScore; }
    public void setUrgencyScore(double urgencyScore) { this.urgencyScore = urgencyScore; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
