module.exports = {
  development: {
    dialect: "sqlite",
    storage: "./db.development.sqlite",
    jwtSecret: "dev-secret"
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    jwtSecret: "test-secret"
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql',
    // use_env_variable: 'DATABASE_URL',
    jwtSecret: process.env.JWT_SECRET
  }
};
