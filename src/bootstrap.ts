import express from 'express'; // Default import for express

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';

import { CustomLoggerService } from '~/processors/logger/logger.service';

import { CorsMiddleware } from '~/common/middlewares/cors.middleware';
import { GlobalConfigMiddleware } from '~/common/middlewares/global-config.middleware';
import { SwaggerMiddleware } from '~/common/middlewares/swagger.middleware';

import { AppModule } from './app.module'; // Root application module

// Declare 'module' for enabling hot module replacement (HMR)
declare const module: any;

/**
 * Bootstrap function to initialize and start the NestJS application.
 * @returns {Promise<void>} A promise that resolves when the application is started.
 */
export async function bootstrap() {
  // Create a new NestJS application instance with Express as the HTTP adapter.
  const expressApp: express.Application = express(); // Create express app correctly
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
    autoFlushLogs: true,
  });

  // Retrieve the configuration service to access environment variables and other configurations
  const configService = app.get(ConfigService);

  // Retrieve the custom logger service to use the application's custom logging mechanism
  const logger = app.get(CustomLoggerService);

  // Configure Cross-Origin Resource Sharing (CORS) using the CorsMiddleware
  new CorsMiddleware().configure(app);

  // Enable global versioning
  app.enableVersioning({
    type: VersioningType.URI, // or VersioningType.HEADER, etc.
  });

  // Apply global configurations like prefixes, interceptors, and validation pipes using the GlobalConfigMiddleware
  new GlobalConfigMiddleware(configService).configure(app);

  // Configure Swagger for API documentation using the SwaggerMiddleware
  new SwaggerMiddleware().configure(app);

  // Start the server and handle startup errors using a dedicated function
  await startServer(app, configService, logger);

  // Enable hot module replacement (HMR) if running in a development environment
  setupHotModuleReplacement(app);
}

/**
 * Start the server and handle startup errors.
 * @param {NestExpressApplication} app - The NestJS Express application instance.
 * @param {ConfigService} configService - The configuration service instance.
 * @param {CustomLoggerService} logger - The custom logger service instance.
 */
async function startServer(app: NestExpressApplication, configService: ConfigService, logger: CustomLoggerService) {
  const port = configService.get<string>('app.port') || '3333';
  const env = configService.get<string>('app.env') || 'development';

  try {
    // Attempt to start the Express server and listen on the specified port
    await app.listen(port, '0.0.0.0'); // Listen on all network interfaces
    // Set the custom logger as the application's logger
    app.useLogger(logger);

    const url = await app.getUrl();
    logger.log(`[PID:${process.pid}] Server listening on: ${url}; NODE_ENV: ${env}`);
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
  }
}

/**
 * Set up hot module replacement for development environments.
 * @param {NestExpressApplication} app - The NestJS Express application instance.
 */
function setupHotModuleReplacement(app: NestExpressApplication) {
  if (module.hot) {
    // If hot module replacement is enabled, accept updates and dispose of the current module on replacement
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
