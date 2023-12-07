import * as SentryHandler from "@sentry/node";
import express from "express";

class Sentry {
  constructor(private app: ReturnType<typeof express>) {
    if (process.env.NODE_ENV !== "test") {
      SentryHandler.init({
        integrations: [
          new SentryHandler.Integrations.Http({ tracing: true }),
          new SentryHandler.Integrations.Express({ app }),
          ...SentryHandler.autoDiscoverNodePerformanceMonitoringIntegrations(),
        ],
        environment: process.env.SENTRY_ENVIRONMENT ?? "local",
        tracesSampleRate: process.env.SENTRY_SAMPLE_RATE
          ? Number(process.env.SENTRY_SAMPLE_RATE)
          : 1.0,
        beforeSendTransaction(event) {
          if (event.transaction === "GET /api") {
            return null;
          }
          return event;
        },
      });

      app.use(SentryHandler.Handlers.requestHandler());
      app.use(SentryHandler.Handlers.tracingHandler());
    }
  }

  public setErrorHandler() {
    if (process.env.NODE_ENV !== "test") {
      this.app.use(SentryHandler.Handlers.errorHandler());
    }
  }

  public static identifyUser(username: string) {
    SentryHandler.setUser({ username });
  }
}

export default Sentry;
