import { getConnectionOptions, createConnection } from "typeorm";

// *set up connection for all tests
export const createTestConn = async (resetDB: boolean = false) => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({
    ...connectionOptions,
    name: "default",
    synchronize: resetDB,
    dropSchema: resetDB
  });
};
