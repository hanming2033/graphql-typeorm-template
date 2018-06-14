import { Connection } from "typeorm";
import * as faker from "faker";

import { INVALID_LOGIN, EMAIL_NOT_CONFIRMED } from "./errorMessages";
import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/TestClient";
import { createTestConn } from "../../../testUtils/createTestConn";

faker.seed(Date.now() + 1);
const email = faker.internet.email();
const password = faker.internet.password();

const client = new TestClient(process.env.TEST_HOST as string);

// whenever typeorm will be used. create a typeorm connection
let conn: Connection;
beforeAll(async () => {
  conn = await createTestConn();
});
afterAll(async () => {
  conn.close();
});

// outsource test function
const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await client.login(e, p);
  // login here is designed to fail due to various situation
  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

describe("login", () => {
  // *do a simply login without registering
  test("login without registering email sends back error", async () => {
    await loginExpectError(
      faker.internet.email(),
      faker.internet.password(),
      INVALID_LOGIN
    );
  });

  // *login after registering email, then chaning the confirm status
  test("email not confirmed & then confirmed", async () => {

    await client.register(email, password);
    // user is not confirmed yet
    await loginExpectError(email, password, EMAIL_NOT_CONFIRMED);
    // update user to confirm status true
    await User.update({ email }, { confirmed: true });
    // login with different pw after confirming 
    await loginExpectError(email, faker.internet.password(), INVALID_LOGIN);
    // login with correct username and pw while confirm = true should return null
    const response = await client.login(email, password);
    expect(response.data).toEqual({ login: null });
  });
});
