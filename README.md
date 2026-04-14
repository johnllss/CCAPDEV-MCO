# CCAPDEV MCO

This repository contains the CCAPDEV MCO project. The runnable Express application lives in `CCAPDEV-MCO-RubberDuckGroup`, a duck-themed community forum built with Express, Handlebars, MongoDB, and session-based authentication.

## Project Structure

```text
.
|-- CCAPDEV-MCO-RubberDuckGroup/   # Main application
`-- README.md
```

## Features

- User registration, login, logout, and session persistence
- Profile editing with profile photo uploads
- Post creation, editing, deletion, voting, and image uploads
- Nested comments with edit and delete support
- Search and filtering for posts by keyword, author, date range, and sort order
- Activity feed per user
- Server-rendered pages using Handlebars partials and layouts

## Tech Stack

- Node.js + npm
- Express 5
- MongoDB + Mongoose
- Handlebars (`hbs`)
- `express-session` with a Mongo-backed session store
- `express-fileupload` for image uploads

## Prerequisites

Before running the project, install:

- Node.js
- npm
- MongoDB, or access to a MongoDB Atlas cluster

## Setup

1. Open a terminal in the repository root.
2. Move into the application folder:

```powershell
cd CCAPDEV-MCO-RubberDuckGroup
```

3. Install dependencies:

```powershell
npm install
```

4. Create a local environment file from the example:

```powershell
Copy-Item .env.example .env
```

5. Update `.env` with your own values:

```env
MONGODB_URI=your-mongodb-connection-string
SESSION_SECRET=your-session-secret
```

## Available Scripts

Run these inside `CCAPDEV-MCO-RubberDuckGroup`:

- `npm start` starts the production server with `node server.js`
- `npm run dev` starts the app with `nodemon`
- `npm run seed` populates the database with sample users, posts, comments, and activity data

## Database Seeding

The seed script only runs when the database is empty. If users, posts, comments, or activity records already exist, seeding is skipped.

Sample seeded accounts use password `password123`. You can log in with either username or email, for example:

- `JohnDuck`
- `johnduck@email.com`

## Running the App

1. Make sure your MongoDB instance is accessible through the `MONGODB_URI` in `.env`.
2. Optionally seed the database:

```powershell
npm run seed
```

3. Start the server:

```powershell
npm start
```

4. Open the app in your browser:

```text
http://localhost:3000
```

## Main Routes

### Pages

- `/` home feed
- `/login` login page
- `/register` registration page
- `/profile` profile page
- `/create-post` post creation page
- `/search-results` filtered search results
- `/about` dependency and third-party library credits

### API / Server Routes

- `/auth` authentication endpoints
- `/users` user profile endpoints
- `/posts` post, vote, and upload endpoints
- `/api/comments` comment endpoints
- `/activity` user activity feed endpoints

## Application Layout

Inside `CCAPDEV-MCO-RubberDuckGroup`:

```text
controllers/   request handlers
models/        Mongoose schemas
public/        static assets, uploaded images, CSS, and client JS
routes/        Express route definitions
utils/         shared helpers such as uploads and session storage
views/         Handlebars pages, partials, and layouts
server.js      application entrypoint
seed.js        database seed script
```