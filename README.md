# Fitness Tracker

A simple fitness tracker application with a Java Spring Boot backend and a React frontend. This repository contains the API server, frontend client, database schema, and tests useful for local development and CI.

## Contents

- `fitness-backend/` - Java Spring Boot backend (Maven)
- `fitness-frontend/` - React frontend (Node / npm)
- `db/fitness_tracker.sql` - Database schema and seed data (SQL)
- `README.md` - This file

## Quick Overview

The backend exposes REST endpoints for authentication, user management, workouts, and goals. The frontend is a single-page React app that consumes the backend API. Tests exist for both backend and frontend.

## Prerequisites

- Java 17+ (or the Java version configured in `fitness-backend/pom.xml`)
- Maven (the repo ships Maven wrapper `mvnw` and `mvnw.cmd`)
- Node.js 16+ and npm
- A relational database (Postgres / MySQL / H2). The `db/fitness_tracker.sql` file contains the schema.

## Backend - Run locally

1. Open a terminal and change into the backend folder:

```bash
cd fitness-backend
```

2. Configure your database connection in `fitness-backend/src/main/resources/application.properties`. Example environment variables or properties you may need to set:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`

3. Run with the Maven wrapper:

On Linux/macOS:

```bash
./mvnw spring-boot:run
```

On Windows (Powershell / cmd):

```powershell
mvnw.cmd spring-boot:run
```

4. The backend defaults to port `8080` (see `application.properties`). API base: `http://localhost:8080`.

Build a production jar:

```bash
./mvnw -DskipTests package
```

The resulting JAR will be under `fitness-backend/target/`.

## Frontend - Run locally

1. Open a terminal and change into the frontend folder:

```bash
cd fitness-frontend
```

2. Install dependencies and start the dev server:

```bash
npm install
npm start
```

3. The frontend dev server typically runs on port `3000` and proxies API calls to the backend during development. See `fitness-frontend/package.json` for proxy configuration.

## Database

- The SQL schema and sample data live in `db/fitness_tracker.sql`.
- Import the file into your chosen RDBMS. Example with Postgres:

```bash
psql -U <user> -d <db> -f db/fitness_tracker.sql
```

- If you prefer to use an in-memory DB for development, adjust `application.properties` to use H2 and run the app; apply the SQL schema file as needed.

## Tests

- Backend unit/integration tests (JUnit / Spring Test):

```bash
cd fitness-backend
./mvnw test
```

- Frontend tests (Jest / React Testing Library):

```bash
cd fitness-frontend
npm test
```

## API - Common Endpoints

The project contains controllers for authentication, users, workouts, and goals. Typical endpoints (adjust paths if your controllers differ):

- `POST /api/auth/login` — authenticate and obtain a token
- `POST /api/auth/signup` — create a new user
- `GET /api/users/{id}` — get user profile
- `GET /api/workouts` — list workouts
- `POST /api/workouts` — log a workout
- `GET /api/goals` — list goals
- `POST /api/goals` — create/update goals

Look at the controller classes in `fitness-backend/src/main/java` for exact paths and request/response shapes.

## Development notes

- Application configuration: `fitness-backend/src/main/resources/application.properties` and `fitness-backend/src/test/resources/application-test.properties` for tests.
- Tests reference sample data and should pass after importing or seeding the database.
- The frontend expects the backend API to be available at the configured proxy URL in `fitness-frontend/package.json` during development.

## Build & Deploy

- Backend: `./mvnw -DskipTests package` produces an executable JAR.
- Frontend: `npm run build` produces static assets in `fitness-frontend/build` which can be served by any static host or integrated into the backend.

## Contributing

1. Fork the repo and create a feature branch.
2. Run backend and frontend tests locally.
3. Open a pull request describing your changes.

## Useful Links

- Backend source: `fitness-backend/src/main/java`
- Frontend source: `fitness-frontend/src`
- SQL schema: `db/fitness_tracker.sql`

## License

This project is provided as-is. Add your preferred license here.

---

If you'd like, I can add example environment variable files, document the exact controller method signatures, or expand the quickstart with Docker Compose. Which would you like next?
