import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/users.entity';

const typeOrmModuleOptions = {
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    return {
      namingStrategy: new SnakeNamingStrategy(),
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [UserEntity],
      synchronize: true, // set 'false' in production
      autoLoadEntities: true,
      logging: false, // set 'false' in production
      keepConnectionAlive: true,
    };
  },
};

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
