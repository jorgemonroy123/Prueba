package com.quiz.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.quiz.app.model.Jugador;

public interface JugadorRepository extends MongoRepository<Jugador, Long> {
}
