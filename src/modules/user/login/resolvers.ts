import * as bcrypt from 'bcryptjs'

import { ResolverMap, ErrorArray } from '../../../types/graphql-utils'
import { User } from '../../../entity/User'
import { INVALID_LOGIN, EMAIL_NOT_CONFIRMED, ACCOUNT_LOCKED } from './errorMessages'
import { userSessionIdPrefix } from '../../../constants'

export const resolvers: ResolverMap = {
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments, { session, redis, req }): Promise<ErrorArray> => {
      // get user from database
      const user = await User.findOne({ where: { email } })
      // check if user exist
      if (!user) {
        return [{ path: 'email', message: INVALID_LOGIN }]
      }
      // check if user have confirmed email address
      if (!user.confirmed) {
        return [{ path: 'email', message: EMAIL_NOT_CONFIRMED }]
      }
      // check if account is locked
      if (user.forgotPasswordLocked) {
        return [{ path: 'email', message: ACCOUNT_LOCKED }]
      }
      // check if password is correct
      const valid = await bcrypt.compare(password, user.password)

      if (!valid) {
        return [{ path: 'email', message: INVALID_LOGIN }]
      }

      // login sucessful
      // express session looks for whenever change is made
      // once change is made to session obj, it then create a cookie and save the data
      // here it will save the user id for this user
      // whenever user makes request to server again, check what the userId is
      session.userId = user.id
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID)
      }

      return null
    }
  }
}
