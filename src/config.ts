import dotenv from "dotenv";

dotenv.config();
const config: {
  port: string;
  apiRoot: false | string;
  sendgrid: {
    key: string;
    default_sender: {
      email: string;
      name: string;
    };
    default_category: string;
  };
  jwt: {
    secret: string;
  };
  wp: {
    logged_in_key: string;
    logged_in_salt: string;
  };
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    charset: string;
  };
  unguessDb: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    charset: string;
  };
  APP_URL: string;
  ssl?: {
    chain: string;
    private: string;
  };
} = {
  port: process.env.PORT || "3000",
  apiRoot: false,
  sendgrid: {
    key: process.env.SENDGRID_KEY || "",
    default_sender: {
      email: process.env.DEFAULT_SENDER_MAIL || "info@unguess.io",
      name: process.env.DEFAULT_SENDER_NAME || "UNGUESS",
    },
    default_category: process.env.DEFAULT_CATEGORY || "UNGUESSAPP_STAGING",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
  },
  wp: {
    logged_in_key: process.env.WP_LOGGED_IN_KEY || "",
    logged_in_salt: process.env.WP_LOGGED_IN_SALT || "",
  },
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tryber_wp",
    charset: process.env.DB_CHARSET || "UTF8MB4_BIN",
  },
  unguessDb: {
    host: process.env.DB_SECONDARY_HOST || "127.0.0.1",
    port: process.env.DB_SECONDARY_PORT
      ? parseInt(process.env.DB_SECONDARY_PORT)
      : 3306,
    user: process.env.DB_SECONDARY_USER || "root",
    password: process.env.DB_SECONDARY_PASSWORD || "",
    database: process.env.DB_SECONDARY_NAME || "unguess_wp",
    charset: process.env.DB_CHARSET || "UTF8MB4_BIN",
  },
  APP_URL: process.env.APP_URL || "https://app.unguess.io/",
};

if (process.env.SSL_CHAIN && process.env.SSL_PRIVATE) {
  config.ssl = {
    chain: process.env.SSL_CHAIN || "",
    private: process.env.SSL_PRIVATE || "",
  };
}

if (process.env.API_ROOT) {
  config.apiRoot = process.env.API_ROOT || false;
}

export default config;
