import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PromptsModule } from './prompts/prompts.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SettingsService } from './settings/settings.service';
import { LEXICA_CRAWL_CURSOR } from './common/const';
import { CreateSettingDto } from './settings/dto/create-setting.dto';
import { SettingsModule } from './settings/settings.module';
// comment code xem nào
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    PromptsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly settingService: SettingsService) {}
  public async onModuleInit(): Promise<void> {
    const { CRAWL_CURSOR, INIT_CURSOR } = LEXICA_CRAWL_CURSOR;

    const crawlCursor = await this.settingService.getSettingByName(
      CRAWL_CURSOR,
    );

    if (!crawlCursor) {
      const objCrawlCursor: CreateSettingDto = {
        key_name: CRAWL_CURSOR,
        key_value: INIT_CURSOR,
      };

      await this.settingService.create(objCrawlCursor);
    }
  }
}
