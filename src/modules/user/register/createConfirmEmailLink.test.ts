import * as Redis from "ioredis";
import fetch from "node-fetch";
import { Connection } from "typeorm";
import * as faker from "faker";

import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { User } from "../../../entity/User";
import { createTestConn } from "../../../testUtils/createTestConn";

// userId is to be passed to createConfirmEmailLink
let userId = "";
// create a redis instance
const redis = new Redis();
faker.seed(Date.now() + 4);

let conn: Connection;

// run before any test in this file
beforeAll(async () => {
  // * create user through typeOrm
  conn = await createTestConn();
  const user = await User.create({
    email: faker.internet.email(),
    password: faker.internet.password()
  }).save();
  // modify the userId using the id returned from User.create
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

test("Make sure it confirms user and clears key in redis", async () => {
  // create the confirmation link
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userId,
    redis
  );

  // send a get request to the url generated using redis
  const response = await fetch(url);
  // .text() because get end point returns "ok" and "invalid"
  const text = await response.text();
  // check if response text is ok
  expect(text).toEqual("ok");
  // test if user's confirmed status is true
  const user = await User.findOne({ where: { id: userId } });
  expect((user as User).confirmed).toBeTruthy();
  // test if the id and userId key value pair is removed
  const chunks = url.split("/");
  const key = chunks[chunks.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});
