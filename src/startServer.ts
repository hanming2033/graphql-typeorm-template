import 'reflect-metadata' // import here and not index.js because test does not run index.js
import 'dotenv/config' // import here and not index.js because test does not run index.js
import { GraphQLServer } from 'graphql-yoga'
import * as session from 'express-session'
import * as connectRedis from 'connect-redis'
import * as RateLimit from 'express-rate-limit'
import * as RateLimitRedisStore from 'rate-limit-redis'

import { redis } from './redis'
import { createTypeormConn } from './utils/createTypeormConn'
import { confirmEmail } from './rest-routes/confirmEmail'
import { genSchema } from './utils/genSchema'
import { redisSessionPrefix } from './constants'
import { createTestConn } from './testUtils/createTestConn'

const SESSION_SECRET = 'ajslkjalksjdfkl'

// this is neccessary for put it into express session
const RedisStore = connectRedis(session as any)

// export the function so Jest can test it
export const startServer = async () => {
  // if in test mode, flush all data in the database
  if (process.env.NODE_ENV === 'test') {
    await redis.flushall()
  }

  // *create the graphql server by merging all the schemas
  const server = new GraphQLServer({
    schema: genSchema(),
    // whatever in injected into context can be used in resolvers
    // url from the request that user sent
    context: ({ request }) => ({
      redis,
      url: request.protocol + '://' + request.get('host'),
      session: request.session,
      req: request
    })
  })

  server.express.use(
    new RateLimit({
      store: new RateLimitRedisStore({
        client: redis
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      delayMs: 0 // disable delaying - full speed until the max limit is reached
    })
  )

  server.express.use(
    session({
      // store is persistent storerage of session information
      // ?consider changing to postgres of db of choice. prob: redis is used to store activation link
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix
      }),
      name: 'qid', // any name will do
      secret: SESSION_SECRET, // a random secret string
      resave: false,
      saveUninitialized: false, // will not create a cookie until session is change
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // must run https
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    } as any)
  )

  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === 'test' ? '*' : (process.env.FRONTEND_HOST as string) // test NODE_ENV because test mode port is random
  }

  // *create a REST api for email confirmation
  server.express.get('/confirm/:id', confirmEmail)

  if (process.env.NODE_ENV === 'test') {
    await createTestConn(true)
  } else {
    // *create a connection to database through typeOrm
    // createConnection will sync our schema to the database
    // because "synchronize": true in ormconfig
    await createTypeormConn()
  }

  // *start the server with different Env variables
  const app = await server.start({
    cors,
    // 0 is test port
    port: process.env.NODE_ENV === 'test' ? 0 : 4000
  })
  console.log('Server is running on localhost:4000')

  return app
}
