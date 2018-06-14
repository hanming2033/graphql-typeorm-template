import { Redis } from 'ioredis'

export interface Session extends Express.Session {
  userId?: string
}

export interface Context {
  redis: Redis
  url: string
  session: Session
  req: Express.Request
}

export type Resolver = (parent: any, args: any, context: Context, info: any) => any

export type GraphQLMiddlewareFunc = (resolver: Resolver, parent: any, args: any, context: Context, info: any) => any

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver
  }
}

// ErrorArray is a generic error type for this server
// null means no error
// not null will have path and message in the error array
export type ErrorArray = IError[] | null
interface IError {
  path: string
  message: string
}
