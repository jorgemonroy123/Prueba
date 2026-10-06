FROM eclipse-temurin:17-jre-alpine
COPY "./target/QUIZ-MONGO-0.0.1-SNAPSHOT.jar" "app.jar"
EXPOSE 8094
ENTRYPOINT [ "java", "-jar", "app.jar" ]