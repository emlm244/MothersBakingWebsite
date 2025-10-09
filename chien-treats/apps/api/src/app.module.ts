import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { LoggingModule } from "./logging/logging.module";
import { PrismaModule } from "./prisma/prisma.module";
import { MetricsModule } from "./metrics/metrics.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { RedisModule } from "./redis/redis.module";
import { appConfig } from "./config/configuration";
import { ProblemDetailsFilter } from "./common/filters/problem-details.filter";
import { MetricsInterceptor } from "./common/interceptors/metrics.interceptor";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { EventsModule } from "./events/events.module";
import { ProductsModule } from "./modules/products/products.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { CouponsModule } from "./modules/coupons/coupons.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { ContentModule } from "./modules/content/content.module";
import { TicketsModule } from "./modules/tickets/tickets.module";
import { SearchModule } from "./modules/search/search.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { StorageModule } from "./storage/storage.module";
import { MailerModule } from "./mailer/mailer.module";
import { DevModule } from "./modules/dev/dev.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      cache: true,
      expandVariables: true,
    }),
    EventEmitterModule.forRoot(),
    LoggingModule,
    RedisModule,
    PrismaModule,
    MetricsModule,
    StorageModule,
    MailerModule,
    EventsModule,
    AuthModule,
    ProductsModule,
    ReviewsModule,
    CouponsModule,
    OrdersModule,
    ContentModule,
    TicketsModule,
    SearchModule,
    PaymentsModule,
    DevModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ProblemDetailsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
