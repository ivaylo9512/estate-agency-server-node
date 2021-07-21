import { createConnection, getConnectionOptions } from 'typeorm'

export const createTypeorm = async(name) => {
    const options = await getConnectionOptions(name)
    return createConnection(options);
}