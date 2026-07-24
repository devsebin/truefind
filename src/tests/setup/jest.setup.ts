process.env.JWT_SECRET = "test_jwt_secret_key_long_enough_for_security";
process.env.JWT_REFRESH_SECRET = "test_jwt_refresh_secret_key_long_enough_for_security";
process.env.TOKEN_SECRET = "test_token_secret_key";
process.env.COOKIE_SECRET = "test_cookie_secret_key";

import { connectDB, clearDB, closeDB } from "./mongo-memory";

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
}, 120000);
