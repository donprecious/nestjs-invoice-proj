import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api/scf');
  const options = new DocumentBuilder()
    .setTitle('Front edge Service Api')
    .setDescription('Front edge api ')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/scf/doc', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  // const seeder = app.get(SeederService);
  // seeder
  //   .seed()
  //   .then(d => console.log('seeder complete'))
  //   .catch(err => console.log('error', err));
  // NestFactory.createApplicationContext(SeederModule).then(appContext => {
  //   console.log('seeding data');
  //   const permissionRepo = appContext.get(SeederService);
  //   permissionRepo.seed().then(data => {
  //     console.log('seeding complete ', data);
  //   });
  // });
  await app.listen(3000);
}
bootstrap();
