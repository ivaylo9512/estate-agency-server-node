import { createConnection, getConnectionOptions } from 'typeorm'

export const createTypeorm = async(name) => {
    const options = await getConnectionOptions(name)
    return createConnection({
        ...options,
        host: '192.168.0.105'
    });
}