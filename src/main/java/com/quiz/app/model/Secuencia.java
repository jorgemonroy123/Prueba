package com.quiz.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "secuencias")
public class Secuencia {

    @Id
    private String id;

    private long valor;

    public Secuencia() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public long getValor() { return valor; }
    public void setValor(long valor) { this.valor = valor; }
}
