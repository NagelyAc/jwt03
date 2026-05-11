export default {
  secret: process.env.JWT_SECRET || "jwt03-secret-key",
  jwtExpiration: Number(process.env.JWT_EXPIRATION) || 30,
  jwtRefreshExpiration: Number(process.env.JWT_REFRESH_EXPIRATION) || 86400,
};
