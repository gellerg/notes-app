# Notes Application

A full-stack notes management application built with React, TypeScript, Node.js, Express, and MongoDB.

The application allows users to securely create and manage personal notes through a RESTful client-server architecture.

## Features

- User registration and authentication
- JWT-based authentication
- Create, read, update, and delete notes
- RESTful API communication between frontend and backend
- MongoDB data persistence
- Input validation and error handling
- Automated backend testing
- Responsive React user interface

## Tech Stack

**Frontend**
- React
- TypeScript

**Backend**
- Node.js
- Express
- REST API

**Database**
- MongoDB

**Authentication**
- JSON Web Tokens (JWT)

**Testing**
- Automated API and backend tests

## Architecture

The project follows a client-server architecture:

`React Frontend → REST API → Express Backend → MongoDB`

The frontend communicates with the backend using HTTP requests and exchanges data in JSON format.

The backend is responsible for authentication, business logic, validation, and interaction with the database.

## API

The backend exposes RESTful endpoints for authentication and note management.

Example operations include:

- `POST /auth/register`
- `POST /auth/login`
- `GET /notes`
- `POST /notes`
- `PUT /notes/:id`
- `DELETE /notes/:id`

Protected endpoints require a valid JWT token.

## What I Practiced

This project gave me hands-on experience with:

- Designing and implementing REST APIs
- Client-server communication
- Authentication and authorization
- Working with persistent data
- Structuring a full-stack TypeScript project
- Testing backend functionality
- Debugging communication between frontend, backend, and database
