# ============================================================
# Multi-stage Dockerfile for ElevateAI Spring Boot Backend
# ============================================================

# Stage 1: Build the JAR with Maven
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app

# Copy Maven wrapper and pom.xml first (for layer caching)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies (cached unless pom.xml changes)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Copy source and build the JAR (skip tests for faster builds)
COPY src ./src
RUN ./mvnw package -DskipTests -q

# ============================================================
# Stage 2: Run on Playwright Java image (contains all Chromium OS dependencies)
# ============================================================
FROM mcr.microsoft.com/playwright/java:v1.41.2-jammy AS runner
WORKDIR /app

# Copy only the built artifact from Stage 1
COPY --from=builder /app/target/*.jar app.jar

# Cloud platforms dynamically assign a PORT env variable
EXPOSE 8095

# Use the PORT env variable if set (Railway/Render), fall back to 8095 for local Docker
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8095}"]
