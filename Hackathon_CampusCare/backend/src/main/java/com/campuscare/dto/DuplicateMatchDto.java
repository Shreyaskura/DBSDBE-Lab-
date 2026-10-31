package com.campuscare.dto;

public class DuplicateMatchDto {
    private Object id;
    private String title;
    private String category;
    private String location;
    private String status;
    private double similarityScore;
    private String confidencePercentage;
    private String reason;

    public DuplicateMatchDto() {}

    public Object getId() { return id; }
    public void setId(Object id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(double similarityScore) { this.similarityScore = similarityScore; }
    public String getConfidencePercentage() { return confidencePercentage; }
    public void setConfidencePercentage(String confidencePercentage) { this.confidencePercentage = confidencePercentage; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
