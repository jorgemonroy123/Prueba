package com.quiz.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.quiz.app.model.Entrenador;

public interface EntrenadorRepository extends MongoRepository<Entrenador, Long> {
}
