package edu.ucsb.cs156.example.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * This is a JPA entity that represents a MenuItemReview, i.e. an entry
 * that comes from the UCSB API for menu item reviews.
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "MenuItemReview")
public class MenuItemReview {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;
  private long itemId;

  private String reviewerEmail;
  private int stars;
  private LocalDateTime dateReviewed;
  private String comments;
}