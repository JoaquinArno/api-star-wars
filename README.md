# conexa-challenge

## 📖 Overview

`conexa-challenge` is a RESTful API built with NestJS. It includes a secure authentication and authorization system using JWT. The API allows user registration and profile updates. It fetches all movies from the public Star Wars API and stores them in a PostgreSQL database. Additionally, it supports full CRUD operations for movies: create, read (all and by ID), update, and delete.

## 🚀 Technologies Used

- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [TypeORM](https://typeorm.io/)
- [Winston](https://github.com/winstonjs/winston) (for logging)
- [Swagger](https://swagger.io/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## ⚙️ Installation & Configuration

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/JoaquinArno/conexa-challenge.git
   cd conexa-challenge
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up your `.env` file**:

   Create a `.env` file in the root directory with the following variables:

   ```env
   ENVIRONMENT=development
   PORT=3000
   API_VERSION=v1
   JWT_SECRET=your_jwt_secret
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   DB_SSL=true
   ```

4. **Start the application**:

   - Development mode:

     ```bash
     npm run start:dev
     ```

   - Production mode:

     ```bash
     npm run start:prod
     ```

5. **Access Swagger documentation**:

   After starting the server, Swagger UI is available at:

   ```
   http://localhost:<PORT>/api
   ```

   It includes complete documentation for endpoints related to authentication, users, and movies.

## 📁 Main Resources

- `/auth`
- `/users`
- `/movies`

All routes are documented using Swagger.

## 🔐 Authentication

The API uses **JWT-based authentication**. You must include a valid token in the `Authorization` header for protected routes:

```
Authorization: Bearer <your_token>
```

## 📄 Scripts

| Command              | Description          |
| -------------------- | -------------------- |
| `npm run start:dev`  | Start in development |
| `npm run start:prod` | Start in production  |
| `npm run build`      | Build the project    |
| `npm run test`       | Run unit tests       |

## ✅ Testing

The project uses **Jest** for testing. Tests are written for services and controllers in each module (`auth`, `user`, and `movie`).

To run the tests:

```bash
npm run test
```

## 📦 Environments

The project is configured to run in **production** with environment-specific variables handled via `.env`.

## 🔐 Credentials (Admin user. For the produccion DB)

**Email:** admin@gmail.com
**Password:** 12345678

## 👤 Author

Developed by **Joaquin Arno**

GitHub repository: [https://github.com/JoaquinArno/conexa-challenge](https://github.com/JoaquinArno/conexa-challenge)

Render deploy: https://conexa-challenge-nu6r.onrender.com
