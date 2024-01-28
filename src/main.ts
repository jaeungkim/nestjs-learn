// Import necessary modules and classes
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';

class Application {
  // Private class properties
  private logger = new Logger(Application.name);
  private DEV_MODE: boolean;
  private PORT: string;
  private corsOriginList: string[];
  private ADMIN_USER: string;
  private ADMIN_PASSWORD: string;

  // Constructor to initialize the Application class
  constructor(private server: NestExpressApplication) {
    this.server = server;

    // Environment variables and default settings
    if (!process.env.SECRET_KEY) this.logger.error('Set "SECRET" env');
    this.DEV_MODE = process.env.NODE_ENV === 'production' ? false : true;
    this.PORT = process.env.PORT || '8000';
    this.corsOriginList = process.env.CORS_ORIGIN_LIST
      ? process.env.CORS_ORIGIN_LIST.split(',').map((origin) => origin.trim())
      : ['*'];
    this.ADMIN_USER = process.env.ADMIN_USER || 'jaeungkim';
    this.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '0526';
  }

  // Setup basic authentication for specific routes (like Swagger docs)
  private setUpBasicAuth() {
    this.server.use(
      ['/docs', '/docs-json'],
      expressBasicAuth({
        challenge: true,
        users: {
          [this.ADMIN_USER]: this.ADMIN_PASSWORD,
        },
      }),
    );
  }

  // Setup OpenAPI (Swagger) middleware for API documentation
  private setUpOpenAPIMidleware() {
    SwaggerModule.setup(
      'docs',
      this.server,
      SwaggerModule.createDocument(
        this.server,
        new DocumentBuilder()
          .setTitle('Jaeung Kim - API')
          .setDescription('TypeORM In Nest')
          .setVersion('0.0.1')
          .build(),
      ),
    );
  }

  // Set up global middleware for the application
  private async setUpGlobalMiddleware() {
    // Enable Cross-Origin Resource Sharing (CORS) with specified origins
    this.server.enableCors({
      origin: this.corsOriginList,
      credentials: true,
    });

    // Invoke the setup methods for basic auth and OpenAPI
    this.setUpBasicAuth();
    this.setUpOpenAPIMidleware();

    // Set up global pipes for request validation
    this.server.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    // Set up global interceptors for response transformation
    this.server.useGlobalInterceptors(
      new ClassSerializerInterceptor(this.server.get(Reflector)),
    );

    // Set up global exception filters for error handling
    this.server.useGlobalFilters(new HttpExceptionFilter());
  }

  // Bootstrap the application by setting up middleware and listening on a port
  async boostrap() {
    await this.setUpGlobalMiddleware();
    await this.server.listen(this.PORT);
  }

  // Log the server start information
  startLog() {
    if (this.DEV_MODE) {
      this.logger.log(`✅ Server on http://localhost:${this.PORT}`);
    } else {
      this.logger.log(`✅ Server on port ${this.PORT}...`);
    }
  }

  // Log any server errors
  errorLog(error: string) {
    this.logger.error(`🆘 Server error ${error}`);
  }
}

// Initialize and start the application
async function init(): Promise<void> {
  // Create a new NestExpressApplication instance
  const server = await NestFactory.create<NestExpressApplication>(AppModule);

  // Create an Application instance with the server
  const app = new Application(server);

  // Bootstrap and start the server
  await app.boostrap();
  app.startLog();
}

// Catch and log any initialization errors
init().catch((error) => {
  new Logger('init').error(error);
});
