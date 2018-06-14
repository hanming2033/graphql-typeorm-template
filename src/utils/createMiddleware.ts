import { Resolver, GraphQLMiddlewareFunc } from '../types/graphql-utils'

// HOF which takes middleware and the actual resolver
// it returns a middleware function with the resolver as input
export const createMiddleware = (middlewareFunc: GraphQLMiddlewareFunc, resolverFunc: Resolver): Resolver => (
  parent: any,
  args: any,
  context: any,
  info: any
) => middlewareFunc(resolverFunc, parent, args, context, info)
