/**
 * Global Configuration Middleware.
 * @file Middleware for setting up global configurations.
 * @module middleware/global-config
 * @description Configures global settings such as route prefixes, interceptors, and validation pipes in a NestJS application.
 */

import { Injectable } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { LoggingInterceptor } from '~/common/interceptors/logging.interceptor';

/**
 * @class GlobalConfigMiddleware
 * @description Middleware for setting up global configurations such as route prefixes, interceptors, and validation pipes in a NestJS application.
 * @example
 * // Usage in a NestJS application:
 * const globalConfigMiddleware = new GlobalConfigMiddleware(configService);
 * globalConfigMiddleware.configure(app, logger);
 */
@Injectable()
export class GlobalConfigMiddleware {
  /**
   * Creates an instance of GlobalConfigMiddleware.
   * @param {ConfigService} configService - The configuration service to access environment variables and configuration settings.
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * Configures the global settings for the application.
   * @param {NestExpressApplication} app - The NestJS Express application instance.
   * @description Sets the global route prefix, applies the global logging interceptor, and sets up the global validation pipe.
   */
  configure(app: NestExpressApplication) {
    // Set global prefix for all routes, e.g., all routes will be prefixed with `/health`
    app.setGlobalPrefix('kelpglobal');

    // Apply the LoggingInterceptor globally to log request/response data
    app.useGlobalInterceptors(new LoggingInterceptor(this.configService));

    // Apply global validation pipe settings to automatically validate incoming requests
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        errorHttpStatusCode: 422,
        forbidUnknownValues: true,
        enableDebugMessages: true,
        stopAtFirstError: true,
      }),
    );
  }
}
