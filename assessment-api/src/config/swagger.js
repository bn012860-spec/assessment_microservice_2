import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Assessment Microservice API',
      version: '1.0.0',
      description: 'API for managing assessments, problems, and submissions',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Version 1 API',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
