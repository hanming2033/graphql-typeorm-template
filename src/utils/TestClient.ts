import * as rp from 'request-promise'

// think of this as normal computer/phone accessing server
export class TestClient {
  url: string
  options: {
    jar: any
    withCredentials: boolean
    json: boolean
  }
  constructor(url: string) {
    // url or port changes per test
    this.url = url
    this.options = {
      withCredentials: true, // true enables saving of cookies
      jar: rp.jar(), // cookie jar: all cookies will be stored here
      json: true
    }
  }

  async register(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            register(email: "${email}", password: "${password}") {
              path
              message
            }
          }
        `
      }
    })
  }

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          logout
        }
        `
      }
    })
  }

  async forgotPasswordChange(newPassword: string, key: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
              path
              message
            }
          }
        `
      }
    })
  }

  async me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          {
            me {
              id
              email
            }
          }
        `
      }
    })
  }

  async login(email: string, password: string) {
    // make a post request with url and options
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          login(email: "${email}", password: "${password}") {
            path
            message
          }
        }
        `
      }
    })
    // return a request promise
  }
}

// TODO: https://www.youtube.com/watch?v=pvjOOApb6nk 1100
