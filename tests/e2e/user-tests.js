import request from 'supertest';
import { app } from './sequential.test';
import { getToken, jwtSecret } from '../../src/authentication/jwt';

const [firstUser, secondUser, thirdUser, forthUser] = Array.from({length: 4}, (user, i) => ({
    username: 'testUser' + i, 
    password: 'testUserPassword' + i, 
    name: 'testName' + i, 
    description: 'test description' + i, 
    location: 'test location' + i,
    email: `testEmail${i}@gmail.com`,
    role: 'user',
}))

export const [updatedFirstUser, updatedSecondUser] = Array.from({length: 2}, (user, i) => ({
    id: i + 1,
    username: 'testUserUpdated' + i, 
    name: 'testNameUpdated' + i, 
    description: 'test description updated' + i, 
    location: 'test location updated' + i,
    email: `testEmailUpdated${i}@gmail.com`,
    role: 'user'
}))
export const adminToken = 'Bearer ' + getToken({
    id: 5, 
    role: 'admin'
})
export let firstToken, secondToken;
let thirdToken, forthToken;
let refreshToken;

const userTests = () => {
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

    it('should retrun 422 when register user with exsisting username', async() => {
        const user = {...firstUser, email: 'uniqueEmail@gmail.com', password: 'testPassword'};
        
        const res = await request(app)
            .post('/users/register')
            .set('Content-Type', 'Application/json')
            .send(user)
            .expect(422);

        expect(res.body.username).toBe('Username is already in use.');
    })

    
    it('should retrun 422 when register user with exsisting email', async() => {
        const user = {...firstUser, username: 'uniqueUsername', password: 'testPassword'};
        
        const res = await request(app)
            .post('/users/register')
            .set('Content-Type', 'Application/json')
            .send(user)
            .expect(422);

        expect(res.body.email).toBe('Email is already in use.');
    })

    it('should retrun 422 when register user with invalid fields', async() => {
        const errors = {
            email: "Must be a valid email.", 
            password: "Password must be between 10 and 22 characters",
            username: "Username must be between 8 and 20 characters", 
            name: "You must provide a name.", 
            location: "You must provide a location.", 
            description: "You must provide a description."
        }

        const res = await request(app)
            .post('/users/register')
            .set('Content-Type', 'Application/json')
            .send({})
            .expect(422);

        expect(res.body).toEqual(errors);
    })

    it('should create users when logged user is admin', async() => {
        const adminUser = {
            ...secondUser, 
            username: 'adminUser', 
            email: 'adminUser@gmail.com', 
            role: 'admin'
        }

        const res = await request(app)
            .post('/users/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send({
                users: [secondUser, thirdUser, forthUser, adminUser]
            })
            .expect(200);

        const [{id: secondId}, {id: thirdId}, {id: forthId}, {id: fifthId, role}] = res.body 
        
        secondUser.id = secondId;
        thirdUser.id = thirdId;
        forthUser.id = forthId;
        adminUser.id = fifthId;

        delete secondUser.password;
        delete thirdUser.password;
        delete forthUser.password;
        delete adminUser.password;

        expect([secondId, thirdId, forthId, fifthId]).toEqual([2, 3, 4, 5]);
        expect(res.body).toEqual([secondUser, thirdUser, forthUser, adminUser]);
    })

    it('should return 401 when creating user with user that is not admin', async() => {
        const user = {
            ...firstUser,
            username: 'uniqueUsername', 
            email: 'uniqueEmail@gmail.com',
            password: 'testPassword'
        }

        const res = await request(app)
            .post('/users/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send({ users: [ user ] })
            .expect(401);

        expect(res.text).toBe('Unauthorized.');
    })
    
    it('should login user with username', async() => {
        const res = await request(app)
            .post('/users/login')
            .set('Content-Type', 'Application/json')
            .send({
                username: secondUser.username,
                password: 'testUserPassword1'
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
                password: 'testUserPassword2'
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
                password: 'testUserPassword3'
            })
            .expect(200);

        forthToken = 'Bearer ' + res.get('Authorization');
        expect(res.body).toEqual(forthUser);
    })

    it('should get token', async() => {
        const res = await request(app)
            .get('/users/refreshToken')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(200);

        expect(res.get('Authorization')).toBeDefined();
    })

    it('should return 401 when login user with wrong password', async() => {
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

    it('should return 404 when findById with nonexistent id', async() => {
        const res = await request(app)
            .get('/users/findById/252')
            .expect(404);

        expect(res.text).toBe('Could not find any entity of type "User" matching: {\n    "id": 252\n}');
    })

    it('should return 401 when updating user from another loggedUser that is not admin: role', async() => {
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

    it('should return 401 when deleting user from another loggedUser that is not admin: role', async() => {
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
            .expect(200);

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

    it('should return 404 when updating nonexistent user', async() => {
        const res = await request(app)
            .patch('/users/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', forthToken)
            .send(forthUser)
            .expect(404);

        expect(res.text).toBe(`Could not find any entity of type "User" matching: {\n    "id": ${forthUser.id}\n}`);
    })

    it('should return 422 when creating users with wrong input', async() => {
        const error = { users0: {
            email: 'Must be a valid email.',
            password: 'Password must be between 10 and 22 characters',
            username: 'Username must be between 8 and 20 characters',
            name: 'You must provide a name.',
            location: 'You must provide a location.',
            description: 'You must provide a description.',
            role: 'You must provide a role.'
          }
        }

        const res = await request(app)
            .post('/users/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send({
                users: [{}]
            })
            .expect(422);

        expect(res.body).toEqual(error);
    })

    it('should return 422 when creating users with usernames that are already in use.', async() => {
        const error = {
            user0: {username: 'Username is already in use.'}, 
            user1: {username: 'Username is already in use.'}
        }
        const firstUser = {...updatedFirstUser, email: 'uniqueEmail1@gmail.com', password: 'testPassword'};
        const secondUser = {...updatedSecondUser, email: 'uniqueEmail1@gmail.com', password: 'testPassword'};

        const res = await request(app)
            .post('/users/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send({
                users: [firstUser, secondUser]
            })
            .expect(422);

        expect(res.body).toEqual(error)
    })
    
    it('should return 422 when creating users with emails that are already in use.', async() => {
        const error = {
            user0: {email: 'Email is already in use.'}, 
            user1: {email: 'Email is already in use.'}
        }
        const firstUser = {...updatedFirstUser, username: 'uniqueUsername', password: 'testPassword'};
        const secondUser = {...updatedSecondUser, username: 'uniqueUsername1', password: 'testPassword'};

        const res = await request(app)
            .post('/users/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send({
                users: [firstUser, secondUser]
            })
            .expect(422);
            
        expect(res.body).toEqual(error);
    })

    it('should return 422 when updating user with invalid input.', async() => {
        const error = {
            id: 'You must provide an id.', 
            email: 'Must be a valid email.', 
            username: 'Username must be between 8 and 20 characters', 
            name: 'You must provide a name.', 
            location: 'You must provide a location.', 
            description: 'You must provide a description.'
        }

        const res = await request(app)
            .patch('/users/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send()
            .expect(422);

        expect(res.body).toEqual(error);
    })

    it('should return 422 when updating user with invalid input.', async() => {
        const error = {
            id: 'You must provide id as a whole number.', 
            email: 'Must be a valid email.', 
            username: 'Username must be between 8 and 20 characters', 
            name: 'You must provide a name.', 
            location: 'You must provide a location.', 
            description: 'You must provide a description.'
        }

        const res = await request(app)
            .patch('/users/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send({id: 'invalid'})
            .expect(422);

        expect(res.body).toEqual(error);
    })

    it('should return 422 when updating user with username that is in use.', async() => {
        const user = {...updatedFirstUser, username: updatedSecondUser.username}
        const error = {username: 'Username is already in use.'};
        
        const res = await request(app)
            .patch('/users/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send(user)
            .expect(422);

        expect(res.body).toEqual(error);
    })

    it('should return 422 when updating user with email that is in use.', async() => {
        const user = {...updatedFirstUser, email: updatedSecondUser.email}
        const error = {email: 'Email is already in use.'};

        const res = await request(app)
            .patch('/users/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send(user)
            .expect(422);

        expect(res.body).toEqual(error);
    })

    it('should return user when findByUsername', async() => {
        const res = await request(app)
            .get('/users/findByUsername/' + updatedFirstUser.username)
            .expect(200);

        expect(res.body).toEqual(updatedFirstUser)
    })

    it('should return 404 when findByUsername with nonexistent username', async() => {
        const res = await request(app)
            .get('/users/findByUsername/nonExistent')
            .expect(404);

        expect(res.text).toEqual('Could not find any entity of type "User" matching: {\n    "username": "nonExistent"\n}')
    })

    
    it('should logout', async() => {
        const res = await request(app)
            .post('/users/logout')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(200);

        expect(res).toBe(true);
    })

    it('should return 401 when deleting user wtihout token', async() => {
        const res = await request(app)
            .delete('/users/auth/delete/1')
            .expect(401);

        expect(res.text).toBe('No auth token');
    })

    it('should return 401 when deleting user with incorrect token', async() => {
        const res = await request(app)
            .delete('/users/auth/delete/1')
            .set('Authorization', 'Bearer incorrect token')
            .expect(401);

        expect(res.text).toBe('jwt malformed');
    })

    it('should return 401 when updating user wtihout token', async() => {
        const res = await request(app)
            .patch('/users/auth/update')
            .set('Content-Type', 'Application/json')
            .expect(401);

        expect(res.text).toBe('No auth token');
    })

    it('should return 401 when updating user with incorrect token', async() => {
        const res = await request(app)
            .patch('/users/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', 'Bearer incorrect token')
            .expect(401);

        expect(res.text).toBe('jwt malformed');
    })

    it('should return 401 when creating user wtihout token', async() => {
        const res = await request(app)
            .post('/users/auth/create')
            .set('Content-Type', 'Application/json')
            .expect(401);

        expect(res.text).toBe('No auth token');
    })

    it('should return 401 when creating user with incorrect token', async() => {
        const res = await request(app)
            .post('/users/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', 'Bearer incorrect token')
            .expect(401);

        expect(res.text).toBe('jwt malformed');
    })
} 
export default userTests;
