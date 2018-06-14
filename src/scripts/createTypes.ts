import { generateNamespace } from '@gql2ts/from-schema'
import * as fs from 'fs'
import * as path from 'path'

import { genSchema } from '../utils/genSchema'

// *convert schema from makeExecutableSchema into a typescript file
// generate the typescript types from the schema
const typescriptTypes = generateNamespace('GQL', genSchema())
// write the types into schema.d.ts
fs.writeFile(path.join(__dirname, '../types/schema.d.ts'), typescriptTypes, err => {
  console.log(err)
})


