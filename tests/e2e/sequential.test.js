import { initialize } from 'app'
import userTests from './user-tests.js'
import propertyTests from './property-tests.js'
import { getConnection } from 'typeorm';
import { User } from '../../src/entities/user.js';
import UserRepository from '../../dist/repositories/user-repository.js';

export let app;
export let orm;
describe('test', () => {
    beforeAll(async() => {
        ({ app, orm } = await initialize());
        await orm.getCustomRepository(UserRepository).save({
            username: 'adminUser', 
            password: 'testUserPassword', 
            name: 'testName', 
            description: 'test description', 
            location: 'test location',
            email: `adminEmail@gmail.com`,
            role: 'admin',
        })

    })

    describe('Users', userTests)
    describe('Properties', propertyTests)

    afterAll(async() => {
        await getConnection('test').close()
    })
})