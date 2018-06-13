import * as yup from 'yup'
import { User } from '../../../entity/User'
import { ResolverMap } from '../../../types/graphql-utils'
import { formatYupError } from '../../../utils/formatYupError'
import { registerPasswordValidation } from '../../../yupSchemas'
import { EMAIL_DUPLICATE, EMAIL_INVALID, EMAIL_TOO_SHORT } from './errorMessages'

// import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";
// import { sendEmail } from "../../utils/sendEmail";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, EMAIL_TOO_SHORT)
    .max(255)
    .email(EMAIL_INVALID),
  password: registerPasswordValidation
})

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments
      // { redis, url }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false })
      } catch (err) {
        return formatYupError(err)
      }

      const { email, password } = args

      // *Check user exist
      // check if user already exist
      const userAlreadyExists = await User.findOne({ where: { email }, select: ['id'] })
      // return error object if user taken
      if (userAlreadyExists) {
        return [{ path: 'email', message: EMAIL_DUPLICATE }]
      }

      // *process user creation after checking
      // User.create simply creates an object
      const user = User.create({
        email,
        password
      })
      // save user to database
      await user.save()

      // if (process.env.NODE_ENV !== 'test') {
      //   await sendEmail(
      //     email,
      //     // generate a link for confirmation.
      //     // custom function: takes the url of the site http://my-site.com, user id in db and redis client
      //     await createConfirmEmailLink(url, user.id, redis)
      //   )
      // }

      return null
    }
  }
}
