import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ToolsModule } from './tools/tools.module';
import { LoansModule } from './loans/loans.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    // 1. Configuración Global (lee el archivo .env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Configuración de Base de Datos Dinámica
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Intentamos leer la URL de la base de datos (típico en producción/Render)
        const dbUrl = configService.get<string>('DATABASE_URL');

        // --- ESCENARIO A: PRODUCCIÓN o local con DATABASE_URL ---
        if (dbUrl) {
          const isProd = process.env.NODE_ENV === 'production';
          console.log(`Conectando a Postgres (${isProd ? 'Producción' : 'Local'})...`);
          return {
            type: 'postgres',
            url: dbUrl,
            autoLoadEntities: true,
            synchronize: true,
            ssl: isProd ? { rejectUnauthorized: false } : false,
          };
        }

        // --- ESCENARIO B: DESARROLLO (Tu PC / SQL Server) ---
        else {
          console.log('💻 Conectando a SQL Server (Local)...');
          return {
            type: 'mssql',
            host: configService.get<string>('DB_HOST') || 'localhost',
            port: parseInt(configService.get<string>('DB_PORT') || '1433', 10),
            username: configService.get<string>('DB_USER'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            
            // SOLUCIÓN AL ERROR DE CONEXIÓN:
            // 'extra' permite pasar configuraciones directas al driver (tedious)
            extra: {
              trustServerCertificate: true, // Confiar en el certificado auto-firmado local
            },
            options: {
              encrypt: false, // Desactivar encriptación estricta para local
              enableArithAbort: true,
            },
          };
        }
      },
    }),

    // 3. Nuestros Módulos de Funcionalidad
    AuthModule,
    UsersModule,
    ToolsModule,
    LoansModule,
    ReviewsModule,
    NotificationsModule,
    MessagesModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}