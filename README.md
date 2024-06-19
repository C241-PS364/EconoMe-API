# EconoME-API

EconoME-API is a backend service designed to manage economic-related data, including user information, incomes, expenses, and machine learning predictions features. This API uses Node.js with the Express framework and PostgreSQL for the database. It also integrates TensorFlow.js for machine learning predictions.

## Features

- User Authentication (Register, Login, Logout)
- CRUD operations for Incomes and Expenses
- Transaction listing and statistics
- Prediction using machine learning
- CI/CD pipeline with Cloud Build
- Deployed on Google Cloud Run
- Documentation for API

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/C241-PS364/EconoMe-API.git
   ```
2. Go to the project directory:
   ```bash
   cd EconoMe-API
   ```
3. Install dependencies:
   ```bash
    npm install
    ```
4. Create a `.env` file in the root directory and add the environment variables (see [Environment Variables](#environment-variables) section).

5. Create a PostgreSQL database and run the SQL scripts in the `db` folder to create the tables.

6. Start the server:
   ```bash
   npm start
   ```
   For development mode with hot-reloading:
    ```bash
    npm run dev
    ```

## Installation with Docker

Run the following commands to build and run the Docker container:

1. Build the Docker image:
   ```bash
   docker build -t econome-api .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 --env-file .env econome-api
   ```

## Usage
Once the server is running, you can use the API endpoints to interact with the system. You can use tools like Postman or curl to test the endpoints.

## Database Setup
Run the SQL scripts located in the database folder to create the necessary tables:
```
users.sql
categories.sql
incomes.sql
expenses.sql
```

## Environment Variables

The following environment variables are required to run the application:


```bash
# Database configuration
INSTANCE_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASS=

# JWT Secret for authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_EXPIRATION_ACCESS=
JWT_EXPIRATION_REFRESH=

# Server port
PORT=
```

## Connecting to Cloud SQL through Cloud SQL Proxy
To connect to Cloud SQL through Cloud SQL Proxy, follow the steps provided in the [Google Cloud documentation](https://cloud.google.com/sql/docs/postgres/connect-admin-proxy).

## Deploying on Google Cloud Platform

1. Build the Docker image:

    ```sh
    docker build -t {region}-docker.pkg.dev/{projectID}/economeapi-image/econome-api:v1 .
    ```
2. Create Docker Repository inside Artifact Registry
    ```sh
    gcloud artifacts repositories create dermatovision-image --repository-format=docker --location={region} --description="EconoMeAPI Docker Repository" --project={projectID}
    ```
3. Authenticate Docker to use the Artifact Registry repository
    ```sh
    gcloud auth configure-docker {region}-docker.pkg.dev
    ```
4. Push the Docker image to the Artifact Registry repository
    ```sh
     docker push {region}-docker.pkg.dev/{projectID}/economeapi-image/econome-api:v1
    ```
5. Deploy it on Cloud Run
    ```sh
    gcloud run deploy EconomeAPI --image={region}-docker.pkg.dev/{projectID}/economeapi-image/econome-api:v1 --region={region} --allow-unauthenticated
    ```
## Environment Variables in Cloud Run
Set the environment variables in the Cloud Run service:

1. Go to the Cloud Run service in the Google Cloud Console.
2. Select your service (EconomeAPI).
3. Click on "Edit & Deploy New Revision".
4. Scroll down to "Environment variables" and add the necessary environment variables.
5. Deploy the revision.

### 


## API Documentation

The API documentation is available at [API Documentation](https://econome-api.kriscode.co/).
