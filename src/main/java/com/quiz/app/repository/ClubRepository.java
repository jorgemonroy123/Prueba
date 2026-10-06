package com.quiz.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.quiz.app.model.Club;

public interface ClubRepository extends MongoRepository<Club, Long> {
}
