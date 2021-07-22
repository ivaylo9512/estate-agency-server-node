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
    email: 'testEmail2@gmail.com',
    role: 'user'
}
const thirdUser = {
    username: 'testUser3', 
    password: 'testUserPassword3', 
    name: 'testName3', 
    description: 'test description3', 
    location: 'test location3',
    email: 'testEmail3@gmail.com',
    role: 'user'
}
const forthUser = {
    username: 'testUser4', 
    password: 'testUserPassword4', 
    name: 'testName4', 
    description: 'test description4', 
    location: 'test location4',
    email: 'testEmail4@gmail.com',
    role: 'user'
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
export let firstToken, secondToken;
let thirdToken, forthToken;
let refreshToken;

const userTests = () => {
    return () => {

        it('should create first user', async() => {

            const res = await request(app)
                .post('/users/register')
                .set('Content-Type', 'Application/json')
                .send(firstUser)
                .expect(200);

                firstUser.id = res.body.id;
                firstUser.role = res.body.role;
                firstToken = 'Bearer ' + res.get('Authorization');
                delete firstUser.password 

                expect(res.body.id).toBe(1);
                expect(res.body).toEqual(firstUser);
        })

        it('should create users when logged user is admin', async() => {

            const res = await request(app)
                .post('/users/auth/create')
                .set('Content-Type', 'Application/json')
                .set('Authorization', adminToken)
                .send([secondUser, thirdUser, forthUser])

                const [{id}, {id: secondId}, {id: thirdId}] = res.body 
                
                secondUser.id = id;
                thirdUser.id = secondId;
                forthUser.id = thirdId;

                delete secondUser.password;
                delete thirdUser.password;
                delete forthUser.password;

                expect(id).toBe(2);
                expect(secondId).toBe(3);
                expect(thirdId).toBe(4);
                expect(res.body).toEqual([secondUser, thirdUser, forthUser]);
        })

        it('should throw UnauthorizedException when creating user with user that is not admin', async() => {
            const res = await request(app)
                .post('/users/auth/create')
                .set('Content-Type', 'Application/json')
                .set('Authorization', firstToken)
                .send(secondUser)
                .expect(401);

                expect(res.text).toBe('Unauthorized.');
        })
        
        it('should login user with username', async() => {
            const res = await request(app)
                .post('/users/login')
                .set('Content-Type', 'Application/json')
                .send({
                    username: secondUser.username,
                    password: 'testUserPassword2'
                })
                .expect(200);

                const refreshCookie = res.get('set-cookie').find(cookie => cookie.includes('refreshToken'));
                expect(refreshCookie).toBeDefined();

                refreshToken = refreshCookie.split(';')[0].split('refreshToken=')[1];
                secondToken = 'Bearer ' + res.get('Authorization');
         
                expect(res.body).toEqual(secondUser);
        })

        it('should login user with email', async() => {
            const res = await request(app)
                .post('/users/login')
                .set('Content-Type', 'Application/json')
                .send({
                    email: thirdUser.email,
                    password: 'testUserPassword3'
                })
                .expect(200);

                thirdToken = 'Bearer ' + res.get('Authorization');
                expect(res.body).toEqual(thirdUser);
        })

        it('should login user with email', async() => {
            const res = await request(app)
                .post('/users/login')
                .set('Content-Type', 'Application/json')
                .send({
                    email: forthUser.email,
                    password: 'testUserPassword4'
                })
                .expect(200);

                forthToken = 'Bearer ' + res.get('Authorization');
                expect(res.body).toEqual(forthUser);
        })

        it('should get token', async() => {
            const res = await request(app)
                .get('/users/refreshToken')
                .set('Cookie', `refreshToken=${refreshToken}`)
                .expect(200)
                .expect(res.get('Authorization')).toBeDefined();
        })

        it('should throw UnauthorizedException when login user with wrong password', async() => {
            const res = await request(app)
                .post('/users/login')
                .set('Content-Type', 'Application/json')
                .send({
                    email: secondUser.email,
                    password: 'wrongPassword'
                })
                .expect(401);

                expect(res.text).toBe('Incorrect username, pasword or email.');
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

                expect(res.text).toBe('Could not find any entity of type "User" matching: {\n    "id": 252\n}');
        })

        it('should throw when updating user from another loggedUser that is not admin: role', async() => {
            const res = await request(app)
                .patch('/users/auth/update')
                .set('Content-Type', 'Application/json')
                .set('Authorization', secondToken)
                .send(updatedFirstUser)
                .expect(401);

                expect(res.text).toBe('Unauthorized.');
        })

        it('should update user when updating with same logged user id', async() => {
            const res = await request(app)
                .patch('/users/auth/update')
                .set('Content-Type', 'Application/json')
                .set('Authorization', firstToken)
                .send(updatedFirstUser)
                .expect(200);

                expect(res.body).toEqual(updatedFirstUser);
        })

        it('should update user when updating with logged user with role: admin', async() => {
            const res = await request(app)
                .patch('/users/auth/update')
                .set('Content-Type', 'Application/json')
                .set('Authorization', adminToken)
                .send(updatedSecondUser)
                .expect(200);

                expect(res.body).toEqual(updatedSecondUser);
        })

        it('should throw UnauthorizedException when deleting user from another loggedUser that is not admin: role', async() => {
            const res = await request(app)
                .delete('/users/auth/delete/1')
                .set('Authorization', secondToken)
                .expect(401);

                expect(res.text).toBe('Unauthorized.');
        })

        it('should delete user when deleting with same logged user id', async() => {
            const res = await request(app)
                .delete('/users/auth/delete/4')
                .set('Authorization', forthToken)
                expect(200)

                expect(res.body).toBe(true);
        })

        it('should delete user when deleting with logged user with role: admin', async() => {
            const res = await request(app)
                .delete('/users/auth/delete/3')
                .set('Authorization', adminToken)
                .expect(200);

                expect(res.body).toBe(true);
        })

        it('should return false when deleting nonexistent user', async() => {
            const res = await request(app)
                .delete('/users/auth/delete/4')
                .set('Authorization', forthToken)
                .expect(200);

                expect(res.body).toBe(false);
        })

        it('should throw EntityNotFound when updating nonexistent user', async() => {
            const res = await request(app)
                .patch('/users/auth/update')
                .set('Content-Type', 'Application/json')
                .set('Authorization', forthToken)
                .send(forthUser)
                .expect(404);
                
                expect(res.text).toBe('User with id: 4 is not found.');
        })
    }
} 
export default userTests;
