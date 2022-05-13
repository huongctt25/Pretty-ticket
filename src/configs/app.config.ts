import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

type Options = {
  validationOpts?: ValidationPipeOptions;
};

export const appConfig = (
  app: INestApplication,
  opts?: Options,
): INestApplication => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
      ...opts?.validationOpts,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    }),
  );

  return app;
};
