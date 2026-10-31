package com.campuscare.dto;

public class AiClassifyResponse {
    private String category;
    private double confidence;
    private String explanation;

    public AiClassifyResponse() {}

    public AiClassifyResponse(String category, double confidence, String explanation) {
        this.category = category;
        this.confidence = confidence;
        this.explanation = explanation;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
