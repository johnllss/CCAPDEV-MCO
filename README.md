# CCAPDEV MCO

This repository contains the CCAPDEV MCO project. The runnable Express application is located in `CCAPDEV-MCO-RubberDuckGroup`.

## Prerequisites

Before running the project, make sure these are installed on your machine:

- Node.js
- npm
- MongoDB Community Server

## Project Setup

1. Open a terminal in the repository root.
2. Move into the application folder:

```cmd
cd CCAPDEV-MCO-RubberDuckGroup
```

3. Install dependencies:

```cmd
npm install
```

This installs `bcrypt, cors, express, express-fileupload, express-handlebars, hbs, mongoose, and nodemon`.

## Seed the Database

1. Make sure MongoDB is running locally on `mongodb://127.0.0.1:27017`.
2. Seed the database:

```cmd
npm run seed
```

The seed script populates the `userDB` database with sample users, posts, comments, and activity data.

## Run the Application

1. Start the server:

```cmd
npm start
```

2. Open this URL in your browser:

```text
http://localhost:3000
```