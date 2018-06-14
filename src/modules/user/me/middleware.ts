import { Resolver } from '../../../types/graphql-utils'

// this middleware simply calls the resolver
export default async (resolver: Resolver, parent: any, args: any, context: any, info: any) => {

  // example beforeware usages
  // logging library console.log('args given:', args)
  // check if user is logged in if (!context.session || !context.session.userId) {}
  // check if user is admin
  
  return resolver(parent, args, context, info)

  // example afterware usages
  // logging result
}
