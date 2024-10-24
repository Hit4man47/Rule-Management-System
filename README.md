
_Created with [AIPRM Prompt "Readme Generator | Markdown Format | GitHub."](https://www.aiprm.com/prompts/softwareengineering/text-editor/1794387468406222848/)_

# Rule Engine Application

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [File Structure](#file-structure)
- [Installation](#installation)
- [Usage](#usage)
  - [Docker Commands](#docker-commands)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Rule Engine Application is a React-based web application designed to allow users to build, manage, and evaluate complex business rules. It provides a visual interface for creating rule conditions and evaluating them against data inputs. This project leverages a backend powered by Node.js, Express, and MongoDB to manage rules and their evaluation.

## Features

- **Rule Building**: Create new business rules with a visual interface.
- **Rule Management**: Edit, update, and combine existing rules.
- **Rule Evaluation**: Test rules against input data.
- **Docker Support**: The application supports containerization using Docker for easy deployment.

## File Structure

\`\`\`plaintext
├── client/
│   ├── components/
│   │   ├── RuleBuilder.jsx        # Component for building rules
│   │   ├── RuleEvaluator.jsx      # Component for evaluating rules
│   │   └── RuleManager.jsx        # Component for managing rules
│   └── RuleEngineApp.jsx          # Main application component
├── server/
│   ├── api.js                     # API client for frontend
│   ├── server.js                  # Server setup and initialization
│   ├── seedAttributes.js          # Seed file for database attributes
│   ├── evaluator.js               # Logic for evaluating rules
│   ├── parser.js                  # Logic for parsing rules
│   └── ruleController.js          # Controller for handling rule-related requests
├── Dockerfile                      # Dockerfile for building the application
└── README.md                       # This README file
\`\`\`

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/get-started)
- [MongoDB](https://www.mongodb.com/)

### Steps

1. **Clone the repository**:

    \`\`\`bash
    git clone https://github.com/your-username/rule-engine-app.git
    cd rule-engine-app
    \`\`\`

2. **Install dependencies**:

    \`\`\`bash
    npm install
    \`\`\`

3. **Setup MongoDB**:
   - Ensure MongoDB is running locally on \`mongodb://localhost:27017/rule-engine\`.

4. **Seed the database**:

    \`\`\`bash
    node server/seedAttributes.js
    \`\`\`

5. **Start the server**:

    \`\`\`bash
    npm start
    \`\`\`

6. **Run the client** (if using a separate React frontend):

    \`\`\`bash
    cd client
    npm start
    \`\`\`

## Usage

### Docker Commands

To build and run the application using Docker:

1. **Pull Docker Image**:

    \`\`\`bash
    docker pull hit4man47/rule-engine-image:latest
    \`\`\`

2. **Run the Docker Container**:

    \`\`\`bash
    docker run -d -p 27017:27017 --name rule-engine-db hit4man47/rule-engine-image:latest
    \`\`\`

3. **Additional Docker Commands**:

    - **Pull Weather Mongo Image**:

        \`\`\`bash
        docker pull hit4man47/weather-mongo-image:latest
        \`\`\`

    - **Run Weather Mongo Container**:

        \`\`\`bash
        docker run -d -p 27017:27017 --name weather-mongo-db hit4man47/weather-mongo-image:latest
        \`\`\`

    - **Stop Weather Mongo Container**:

        \`\`\`bash
        docker stop weather-mongo-db
        \`\`\`

    - **Remove Weather Mongo Container**:

        \`\`\`bash
        docker rm weather-mongo-db
        \`\`\`

## API Endpoints

### Rules

- **GET /api/rules** - Fetch all rules.
- **POST /api/rules** - Create a new rule.
- **PUT /api/rules/:id** - Update an existing rule.
- **GET /api/rules/:id/ast** - Fetch AST of a rule.

### Evaluation

- **POST /api/evaluate** - Evaluate a rule against data.

### Attributes

- **GET /api/attributes** - Fetch available attributes.
- **POST /api/attributes** - Create a new attribute.

## Technologies Used

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express, MongoDB
- **API Client**: Axios
- **Data Modeling**: Mongoose
- **Containerization**: Docker

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.
