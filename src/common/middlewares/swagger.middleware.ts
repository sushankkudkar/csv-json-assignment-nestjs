/**
 * Swagger Middleware.
 * @file Middleware for configuring Swagger documentation.
 * @module middleware/swagger
 * @description Sets up and configures Swagger API documentation in a NestJS application using Fastify.
 */

import { Injectable } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';

/**
 * @class SwaggerMiddleware
 * @description Middleware for configuring and setting up Swagger API documentation in a NestJS application.
 * @example
 * // Usage in a NestJS application:
 * const swaggerMiddleware = new SwaggerMiddleware();
 * swaggerMiddleware.configure(app);
 */
@Injectable()
export class SwaggerMiddleware {
  /**
   * Configures Swagger for API documentation.
   * @param {NestExpressApplication} app - The NestJS Express application instance.
   * @description Sets up Swagger using the provided application instance and configuration settings.
   */
  configure(app: NestExpressApplication) {
    // Create Swagger configuration using the DocumentBuilder
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API description')
      .setVersion('1.0')
      .addTag('Nest HTTP API Documentation')
      .build();

    // Create a Swagger document using the configured settings
    const document = SwaggerModule.createDocument(app, config);

    // Setup Swagger at the '/api' route
    SwaggerModule.setup('api', app, document);
  }
}
