import { v4 } from "uuid";
import { Redis } from "ioredis";
// http://localhost:4000
// https://my-site.com
// => https://my-site.com/confirm/<id>
export const createConfirmEmailLink = async (
  url: string,
  userId: string,
  redis: Redis
) => {
  // create an uuid
  const id = v4();
  // map the id to userId which expires in 1 day
  // user click on the link to trigger activation of userId
  await redis.set(id, userId, "ex", 60 * 60 * 24);
  // return an url with activation link using id
  return `${url}/confirm/${id}`;
};
