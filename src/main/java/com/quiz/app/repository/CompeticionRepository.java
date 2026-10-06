package com.quiz.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.quiz.app.model.Competicion;

public interface CompeticionRepository extends MongoRepository<Competicion, Long> {
}
