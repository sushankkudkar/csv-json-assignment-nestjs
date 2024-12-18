# CSV to JSON Importer - NestJS Application

This project is built using the [NestJS](https://nestjs.com/) framework, a progressive Node.js framework for building efficient and scalable server-side applications. The application uses Docker for local development, Postgres as the database, and Redis for managing queues with Bull.

## Features

- **NestJS Framework**: Backend architecture built using NestJS.
- **Postgres Database**: Utilizes Postgres for persistent data storage.
- **Redis Queue with Bull**: Redis is used with Bull for handling background jobs (CSV file import).
- **Prisma ORM**: For interacting with the Postgres database.

## Installation & Setup

### 1. Clone the Repository

To get started, clone the repository and navigate into the project folder.

```bash
git clone https://github.com/your-repo/csv-json-assignment-nestjs.git
cd csv-json-assignment-nestjs
```

### 2. Setup ENV

Setup the .env file:

Copy the example .env.example file to .env in the root directory.

```bash
cp .env.example .env
```

You can configure any required environment variables (e.g., Postgres and Redis settings) in this file.

### 3. Run the Application Locally with Docker

The application uses Docker for local development, with containers for Postgres and Redis.

Prerequisites: Ensure that Docker is installed on your machine. If not, follow the official Docker installation guide. https://docs.docker.com/desktop/setup/install/mac-install/

To run the application with Docker, execute the following command to start the Docker containers for both Postgres and Redis.

```bash
docker pull redis:latest
docker run --name redis-container -p 6379:6379 -d redis:latest
docker run --name redis-container -e REDIS_PASSWORD=password -p 6379:6379 -d redis:latest
docker ps
```

```bash
docker pull postgres:latest
docker run --name postgres-container -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=csv-json-kelp -p 5432:5432 -d postgres:latest
docker ps
```

This command will:

Start Postgres on the default port 5432.  
Start Redis on the default port 6379.

### 4. Install Node.js Dependencies

Once the Docker containers are running, you need to install the necessary Node.js dependencies:

```bash
npm install
```

### 5. Running the Application

To run the application in development mode, use the following command:

```bash
npm run dev
```

This command will:

Generate the Prisma client (prisma:generate).  
Start the NestJS server in watch mode (start:dev), allowing for live reloading as you make changes.  
Running the Application in Other Modes.

Prisma Database Migrations
To apply Prisma migrations, use the following commands:

Create a migration:

```bash
npm run migrate:dev:create --name your-migration-name
```

Apply migrations:

```bash
npm run migrate:dev:apply
```

Importing CSV Data
The application includes functionality to import CSV data via Bull and Redis queues. Trigger the CSV import job using the following cURL command:

### 1. Trigger the Import Job

Use the curl command to upload a CSV file and trigger the background processing job:

```bash
curl --location 'localhost:8000/kelpglobal/jobs/import-csv' \
--form 'file=@"/path/to/your/csv-file.csv"'
```

Replace "/path/to/your/csv-file.csv" with the actual path to your CSV file. This will upload the file to the server, where it will be processed in the background using the Bull queue.

```bash

Author: Sushank Kudkar
Contact No: 8779709770
Email Id: sushank.kudkar@gmail.com
Stay in Touch
```
