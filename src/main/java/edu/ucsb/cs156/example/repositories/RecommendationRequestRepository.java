package edu.ucsb.cs156.example.repositories;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import edu.ucsb.cs156.example.entities.RecommendationRequest;

/**
 * The UCSBDiningCommonsRepository is a repository for RecommendationRequest entities
 */
@Repository
public interface RecommendationRequestRepository extends CrudRepository<RecommendationRequest, Long> {
//  @param id
//  @return
}