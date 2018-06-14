import { Connection } from "typeorm";
import * as faker from "faker";

import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/TestClient";
import { createTestConn } from "../../../testUtils/createTestConn";

let userId: string;
let conn: Connection;
faker.seed(Date.now() + 3);
const email = faker.internet.email();
const password = faker.internet.password();

beforeAll(async () => {
  conn = await createTestConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe("me", () => {
  test("return null if no cookie(not logged in)", async () => {
    // create new client instance
    const client = new TestClient(process.env.TEST_HOST as string);
    // client sends me request
    const response = await client.me();
    // request should be null
    expect(response.data.me).toBeNull();
  });

  test("get current user when logged in", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.login(email, password);
    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });
});
