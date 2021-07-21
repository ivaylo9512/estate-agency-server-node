import request from 'supertest';
import { app, token } from './sequential.test';
import { getToken } from '../../src/authentication/jwt';

export const firstUser = {
    username: 'testUser', 
    password: 'testUserPassword', 
    name: 'testName', 
    description: 'test description', 
    location: 'test location' 
}
export const secondUser = {
    username: 'testUser2', 
    password: 'testUserPassword2', 
    name: 'testName2', 
    description: 'test description2', 
    location: 'test location2' 
}
export const adminToken = getToken({
    id: 3, 
    admin: 'admin'
})
export let firstToken;
export let secondToken;
const userTests = () => {
    return () => {

        it('should create first user', async() => {

            const res = await request(app)
                .post('/users/register')
                .set('Content-Type', 'Application/json')
                .send(firstUser)
                .expect(200);

                firstUser.id = res.body.id;
                firstToken = res.get('Authorization');
                delete firstUser.password 

                expect(res.body.id).toBe(1);
                expect(res.body).toEqual(firstUser);
        })

        let password = secondUser.password;
        it('should create second user', async() => {

            const res = await request(app)
                .post('/users/register')
                .set('Content-Type', 'Application/json')
                .send(secondUser)
                .expect(200);

                secondUser.id = res.body.id;
                secondToken = res.get('Authorization');
                delete secondUser.password 

                expect(res.body.id).toBe(2);
                expect(res.body).toEqual(secondUser);
        })

        it('should login user', async() => {
            const res = await request(app)
                .post('/users/login')
                .set('Content-Type', 'Application/json')
                .send({
                    username: secondUser.username,
                    password
                })
                .expect(200)
                .expect(res.body).toEqual(secondUser)
        })
    }
} 
export default userTests;
