import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { FusionVersionModule } from './fusion-version/fusion-version.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IbizaVersionsModule } from './ibiza-versions/ibiza-versions.module';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import { RedisCache } from 'apollo-server-cache-redis';
import { SsrModule } from './ssr/ssr.module';
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
      entities: [
        process.env.NODE_ENV === 'production'
          ? './**/**.entity.js'
          : './**/**.entity.ts',
      ],
      ssl: true,
      synchronize: false,
      cache: {
        type: 'redis',
        duration: 60000,
        options: {
          host: 'uxversions.redis.cache.windows.net',
          port: 6380,
          password: '86Mg4ExIC0imrEVyjmiEdtDn313OlHNBfutx1U4E5FE=',
          tls: { servername: 'uxversions.redis.cache.windows.net' },
        },
      },
    }),
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      installSubscriptionHandlers: true,
      playground: true,
      introspection: true,
      resolvers: {
        Date: GraphQLDate,
        Time: GraphQLTime,
        DateTime: GraphQLDateTime,
      },
      definitions: {
        path: join(process.cwd(), './graphql.schema.ts'),
        outputAs: 'class',
      },
    }),
    SsrModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
