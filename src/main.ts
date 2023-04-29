import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AppModule } from './modules/app/app.module';
import { protobufPackage } from './modules/score/score';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: protobufPackage,
        protoPath: join(__dirname, 'modules/score/score.proto'),
        url: '0.0.0.0:5000',
      },
    },
  );

  await app.listen();
}
bootstrap();
