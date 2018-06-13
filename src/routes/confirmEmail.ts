import { Request, Response } from 'express'
import { User } from '../entity/User'
import { redis } from '../redis'

// when user click on the confirmation link. trigger this get request
export const confirmEmail = async (req: Request, res: Response) => {
  // get the id from the url
  const { id } = req.params
  // get userId using redis, because the id and userId is mapped in createConfirmationEmailLink.ts
  const userId = await redis.get(id)
  if (userId) {
    // update db through typeOrm
    await User.update({ id: userId }, { confirmed: true })
    await redis.del(id)
    // TODO: change response type to work with client
    res.send('ok')
  } else {
    // TODO: change response type to work with client
    res.send('invalid')
  }
}
