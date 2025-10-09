import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<boolean>("app.isProduction");
        return {
          pinoHttp: {
            level: isProd ? "info" : "debug",
            transport: isProd
              ? undefined
              : {
                  target: "pino-pretty",
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: "SYS:standard",
                  },
                },
            redact: {
              paths: ["req.headers.authorization", "req.body.password", "res.headers.set-cookie"],
              remove: true,
            },
            autoLogging: true,
          },
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
export class LoggingModule {}
