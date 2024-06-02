import "dotenv/config";

export const config = {
  DB: process.env.DB_URL,
  PORT: process.env.SERVER_PORT,
  SECRET_ACCESS: process.env.ACCESS_TOKEN || "SECRET_TOKEN_ACCESS",
  SECRET_REFRESH: process.env.REFRESH_TOKEN || "SECRET_TOKEN_REFRESH",
  ACCESS_EXPIRE_TIME: "15m",
  THIRTY_DAYS: 30 * 24 * 60 * 60 * 1000,
  PAGE_SIZE: 10,
  ROLE: { ADMIN: "admin", EMPLOYEE: "employee", customer: "customer" },
  ROLE_NUM: {
    ADMIN: process.env.ADMIN || "aebf43b5d72dace9990b3",
    EMPLOYEE: process.env.EMPLOYEE || "e8da0c1a1d0bce96e38c4",
    CUSTOMER: process.env.CUSTOMER || "c594625a33508722f7f8d",
  },

};
