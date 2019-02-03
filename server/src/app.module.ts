import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { FusionVersionModule } from './fusion-version/fusion-version.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IbizaVersionsModule } from './ibiza-versions/ibiza-versions.module';
import {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
} from 'graphql-iso-date';

@Module({
  imports: [
    FusionVersionModule,
    IbizaVersionsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_ENDPOINT,
      port: 5432,
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: ['src/**/**.entity{.ts,.js}'],
      ssl: true,
      synchronize: true,
    }),
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      installSubscriptionHandlers: true,
      playground: true,
      resolvers: { Date: GraphQLDate, Time: GraphQLTime, DateTime: GraphQLDateTime},
      definitions: {
        path: join(process.cwd(), 'src/graphql.schema.ts'),
        outputAs: 'class',
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
