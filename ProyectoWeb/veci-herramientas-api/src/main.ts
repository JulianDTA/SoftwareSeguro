import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',      
      'http://localhost:4173',      
      /https:\/\/.*\.vercel\.app/,
      /https:\/\/.*\.onrender\.com/,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`Aplicación corriendo en el puerto: ${port}`);
}
bootstrap();