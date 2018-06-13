import { Connection } from 'typeorm'
import * as faker from 'faker'

import { User } from '../../../entity/User'
import { EMAIL_DUPLICATE, EMAIL_TOO_SHORT, EMAIL_INVALID, PASSWORD_TOO_SHORT } from './errorMessages'
import { TestClient } from '../../../utils/TestClient'
import { createTestConn } from '../../../testUtils/createTestConn'

faker.seed(Date.now() + 5)
const email = faker.internet.email()
const password = faker.internet.password()

const client = new TestClient(process.env.TEST_HOST as string)

let conn: Connection
// before all is a Jest command which means that it will
// do whatever that is inside the call back before any test
beforeAll(async () => {
  conn = await createTestConn()
})
afterAll(async () => {
  conn.close()
})

// this test requires the server to start and run in the background
describe('Register user', async () => {
  it('check for duplicate emails', async () => {
    // *make sure we can register a user
    // send register mutation
    const response = await client.register(email, password)
    // check if register null ==> successful
    expect(response.data).toEqual({ register: null })
    // try to find all users with the email
    const users = await User.find({ where: { email } })
    // check if users return only have 1 user
    expect(users).toHaveLength(1)
    // check if user returned is same as the user we created
    const user = users[0]
    expect(user.email).toEqual(email)
    expect(user.password).not.toEqual(password)

    // *make sure duplicated user cannot be created
    // error ==> {register:[{path:'email', message:'...'},{}]}
    const response2 = await client.register(email, password)
    // check if mutation return exactly 1 object
    expect(response2.data.register).toHaveLength(1)
    // check if the first error's path is email
    expect(response2.data.register[0]).toEqual({
      path: 'email',
      message: EMAIL_DUPLICATE
    })
  })

  it('check bad email', async () => {
    // error ==> {register:[{path:'email', message:'...'},{}]}
    const response3 = await client.register('b', password)
    // above email will fail with 2 errors
    expect(response3.data).toEqual({ register: [{ path: 'email', message: EMAIL_TOO_SHORT }, { path: 'email', message: EMAIL_INVALID }] })
  })

  it('check bad password', async () => {
    // error ==> {register:[{path:'email', message:'...'},{}]}
    const response4 = await client.register(faker.internet.email(), 'ad')
    // above email will fail with 2 errors
    expect(response4.data).toEqual({ register: [{ path: 'password', message: PASSWORD_TOO_SHORT }] })
  })

  it('check bad password and bad email', async () => {
    // error ==> {register:[{path:'email', message:'...'},{}]}
    const response5 = await client.register('df', 'ad')
    // above email will fail with 3 errors
    expect(response5.data).toEqual({
      register: [
        { path: 'email', message: EMAIL_TOO_SHORT },
        { path: 'email', message: EMAIL_INVALID },
        { path: 'password', message: PASSWORD_TOO_SHORT }
      ]
    })
  })
})
