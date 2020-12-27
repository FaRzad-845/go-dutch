import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  port: parseInt(process.env.PORT, 10),

  nodeEnv: process.env.NODE_ENV,

  // ToDO -> good to have multiple database for different environment
  databaseURL: process.env.NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017/go-dutch' : process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,
  jwtAlgorithm: process.env.JWT_ALGO,

  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  agenda: {
    dbCollection: process.env.AGENDA_DB_COLLECTION,
    pooltime: '30 seconds',
    concurrency: 5,
  },

  agendash: {
    user: process.env.AGENDASH_USER,
    password: process.env.AGENDASH_PASSWORD,
  },

  api: {
    prefix: '/api',
  },

  swaggerOptions: {
    swaggerDefinition: {
      openapi: '3.0.1',
      info: {
        title: 'Go-Dutch Back-End API',
        version: '1.0.0',
        description: 'All api related to Go-Dutch application .',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['src/api/routes/*.ts', 'src/utils/definitions.yml'],
  },
};
