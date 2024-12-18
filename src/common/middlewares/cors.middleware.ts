/**
 * CORS Middleware.
 * @file Middleware for configuring Cross-Origin Resource Sharing (CORS) settings.
 * @module middleware/cors
 * @description Middleware to set up and manage CORS policies in a NestJS application.
 * It allows or restricts access from specified origins to enhance application security.
 */

import { Injectable } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

/**
 * @class CorsMiddleware
 * @description Middleware class to configure Cross-Origin Resource Sharing (CORS) settings for the application.
 * @example
 * // Usage in a NestJS application:
 * const corsMiddleware = new CorsMiddleware();
 * corsMiddleware.configure(app);
 */
@Injectable()
export class CorsMiddleware {
  /**
   * Configure CORS settings for the application.
   * @param {NestExpressApplication} app - The NestJS Express application instance.
   * @description This method sets up the CORS configuration to allow or restrict access from specific origins.
   * It uses a dynamic configuration that can either allow all origins or restrict access based on a list of allowed hosts.
   */
  configure(app: NestExpressApplication) {
    // List of origins allowed to access the application. '*' means all origins are allowed.
    const allowedOrigins = ['*'];

    // Convert allowed origins (except '*') into regular expressions for matching against incoming requests
    const allowedHosts = allowedOrigins.filter((origin) => origin !== '*').map((origin) => new RegExp(origin, 'i'));
    // Enable CORS with the specified settings
    app.enableCors({
      origin: (origin, callback) => {
        if (allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          const isAllowed = allowedHosts.some((host) => host.test(origin));
          callback(null, isAllowed);
        }
      },
      credentials: true,
    });
  }
}
