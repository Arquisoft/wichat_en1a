require('dotenv').config();
const express = require('express');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const YAML = require('yaml');

const app = express();
const gatewayRoutes = require('./routes/gateway-routes');

// Middleware
app.use(express.json());

const corsOptions = {
    origin: [
        process.env.WEBAPP_URL || 'http://localhost:3000',
        process.env.DEPLOY_DOMAIN || 'http://localhost:3000',
        'https://wichat-en1a.duckdns.org',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['content-type'],
    credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Prometheus metrics
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// Swagger/OpenAPI
const openapiPath = './openapi.yaml';
if (fs.existsSync(openapiPath)) {
    const file = fs.readFileSync(openapiPath, 'utf8');
    const swaggerDocument = YAML.parse(file);
    app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
    console.log('Not configuring OpenAPI. Configuration file not present.');
}

// Todas las rutas
app.use('/api', gatewayRoutes);

module.exports = app;
