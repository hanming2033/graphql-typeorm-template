import * as Redis from 'ioredis'

// keep one copy of redis
export const redis = new Redis()
