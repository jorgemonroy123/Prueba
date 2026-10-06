package com.quiz.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.quiz.app.model.Asociacion;

public interface AsociacionRepository extends MongoRepository<Asociacion, Long> {
}
