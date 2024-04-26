import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserModule } from './components/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'assessment',
      password: 'password',
      database: 'app',
      entities: [ UserEntity ],
      synchronize: true,
    }),
    UserModule,
  ],
  controllers: [ AppController ],
  providers: [ AppService ],
})
export class AppModule {

}
