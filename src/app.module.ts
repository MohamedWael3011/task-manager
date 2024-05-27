import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [TasksModule, AuthModule, DatabaseModule],
  controllers: [],
  providers: []
})
export class AppModule {}
