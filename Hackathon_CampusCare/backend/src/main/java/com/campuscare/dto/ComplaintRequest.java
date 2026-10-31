package com.campuscare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ComplaintRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 15, message = "Description must provide sufficient detail (at least 15 characters)")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String campusBlock;
    private String building;
    private String room;
    private String location; // Fallback or computed
    private String imageUrl;

    public ComplaintRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getCampusBlock() { return campusBlock; }
    public void setCampusBlock(String campusBlock) { this.campusBlock = campusBlock; }
    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }
    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
