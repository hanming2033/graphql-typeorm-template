import * as faker from "faker";
import { Connection } from "typeorm";

import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/TestClient";
import { createTestConn } from "../../../testUtils/createTestConn";

let conn: Connection;
faker.seed(Date.now() + 2);
const email = faker.internet.email();
const password = faker.internet.password();

let userId: string;
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

describe("logout", () => {
  test("logout should kill multiple sessions", async () => {
    // computer 1
    const sess1 = new TestClient(process.env.TEST_HOST as string);
    // computer 2
    const sess2 = new TestClient(process.env.TEST_HOST as string);
    // login on 2 diff device
    await sess1.login(email, password);
    await sess2.login(email, password);
    // me request from both response shld be same
    expect(await sess1.me()).toEqual(await sess2.me());
    // logout on 1 device
    await sess1.logout();
    // both should be logged out
    expect(await sess1.me()).toEqual(await sess2.me());
  });

  test("logout in single session should prevent me request", async () => {
    // create a new instance of client
    const client = new TestClient(process.env.TEST_HOST as string);
    // client sends login request
    // email and password are valid because created in the last step
    await client.login(email, password);
    // client sends me request to get user information
    const response = await client.me();
    // test if user from me request is same as user logged in
    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
    // client sends logout request
    await client.logout();
    // client sends me request
    const response2 = await client.me();
    // test request response should be null
    expect(response2.data.me).toBeNull();
  });
});
