package com.quiz.app.config;

import org.springframework.context.annotation.Lazy;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertCallback;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import com.quiz.app.model.ConId;
import com.quiz.app.model.Secuencia;

@Component
public class IdAutoincrementalCallback implements BeforeConvertCallback<ConId> {

    private final MongoOperations mongoOperations;

    public IdAutoincrementalCallback(@Lazy MongoOperations mongoOperations) {
        this.mongoOperations = mongoOperations;
    }

    @Override
    public ConId onBeforeConvert(ConId entidad, String coleccion) {
        if (entidad.getId() == null) {
            Secuencia secuencia = mongoOperations.findAndModify(
                    Query.query(Criteria.where("_id").is(coleccion)),
                    new Update().inc("valor", 1),
                    FindAndModifyOptions.options().returnNew(true).upsert(true),
                    Secuencia.class);
            entidad.setId(secuencia.getValor());
        }
        return entidad;
    }
}
