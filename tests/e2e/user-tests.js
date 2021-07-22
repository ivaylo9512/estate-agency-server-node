import request from 'supertest';
import { app } from './sequential.test';
import { getToken } from '../../src/authentication/jwt';

const firstUser = {
    username: 'testUser', 
    password: 'testUserPassword', 
    name: 'testName', 
    description: 'test description', 
    location: 'test location',
    email: 'testEmail@gmail.com'
}
const secondUser = {
    username: 'testUser2', 
    password: 'testUserPassword2', 
    name: 'testName2', 
    description: 'test description2', 
    location: 'test location2',
    email: 'testEmail2@gmail.com'
}
export const updatedFirstUser = {
    id: 1,
    username: 'testUserUpdated', 
    name: 'testNameUpdated', 
    description: 'test description updated', 
    location: 'test location updated',
    email: 'testEmailUpdated@gmail.com'
}
export const updatedSecondUser = {
    id: 2,
    username: 'testUserUpdated2', 
    name: 'testNameUpdated2', 
    description: 'test descriptionUpdated2', 
    location: 'test locationUpdated2',
    email: 'testEmailUpdated2@gmail.com'
}
export const adminToken = 'Bearer ' + getToken({
    id: 3, 
    role: 'admin'
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
                firstToken = 'Bearer ' + res.get('Authorization');
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
                secondToken = 'Bearer ' + res.get('Authorization');
                delete secondUser.password;

                expect(res.body.id).toBe(2);
                expect(res.body).toEqual(secondUser);
        })

        it('should login user with username', async() => {
            const res = await request(app)
                .post('/users/login')
                .set('Content-Type', 'Application/json')
                .send({
                    username: secondUser.username,
                    password
                })
                .expect(200);

                expect(res.body).toEqual(secondUser);
        })

        it('should throw Unauthorized when login user with wrong password', async() => {
            const res = await request(app)
                .post('/users/login')
                .set('Content-Type', 'Application/json')
                .send({
                    email: secondUser.email,
                    password: 'wrongPassword'
                })
                .expect(401);

                expect(res.text).toEqual('Incorrect username, pasword or email.');
        })

        it('should return firstUser when findById with id 1', async() => {
            const res = await request(app)
                .get('/users/findById/1')
                .expect(200);

                expect(res.body).toEqual(firstUser);
        })

        it('should throw EntityNotFound when findById with nonexistent id', async() => {
            const res = await request(app)
                .get('/users/findById/252')
                .expect(404);

                expect(res.text).toEqual('Could not find any entity of type "User" matching: {\n    "id": 252\n}');
        })

        it('should throw when updating user from another loggedUser that is not admin: role', async() => {
            const res = await request(app)
                .patch('/users/auth/update')
                .set('Content-Type', 'Application/json')
                .set('Authorization', secondToken)
                .send(updatedFirstUser)
                .expect(401);

                expect(res.text).toEqual('Unauthorized.');
        })

        it('should update user when udating with same looged user id', async() => {
            const res = await request(app)
                .patch('/users/auth/update')
                .set('Content-Type', 'Application/json')
                .set('Authorization', firstToken)
                .send(updatedFirstUser)
                .expect(200);

                expect(res.body).toEqual(updatedFirstUser);
        })
        it('should update user when udating with looged user with role: admin', async() => {
            const res = await request(app)
                .patch('/users/auth/update')
                .set('Content-Type', 'Application/json')
                .set('Authorization', adminToken)
                .send(updatedSecondUser)
                .expect(200);

                expect(res.body).toEqual(updatedSecondUser);
        })
    }
} 
export default userTests;
