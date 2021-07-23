import { initialize } from 'app'
import userTests from './user-tests.js'
import propertyTests from './property-tests.js'
import { getConnection } from 'typeorm';

export let app;
describe('test', () => {
    beforeAll(async() => {
        app = await initialize();
    })

    describe('Users', userTests)
    describe('Properties', propertyTests)

    afterAll(async() => {
        await getConnection('test').close()
    })
})