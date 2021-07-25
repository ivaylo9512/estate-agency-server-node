import request from 'supertest';
import { app } from './sequential.test';
import { firstToken, secondToken, adminToken, updatedFirstUser, updatedSecondUser } from './user-tests'

const propertyTests = () => {
    const [fistProperty, secondProperty, thirdProperty, forthProperty] = Array.from({length: 4}, (v, i) => ({
        name: 'testProperty' + i,
        description: 'testProperty' + i,
        price: 4000000 * (i + 1),
        size: 12000 * (i + 1),
        location: 'testLocation' + i
    }));
    
    const [updatedFirstProperty, updatedSecondProperty] = Array.from({length: 2}, (v, i) => ({
        id: i + 1,
        name: 'testPropertyUpdated' + i,
        description: 'testPropertyUpdated' + i,
        price: 4500000 * (i + 1),
        size: 15000 * (i + 1), 
        location: 'testLocationUpdated' + i
    }))

    it('should create a property', async () => {
        const res = await request(app)
            .post('/properties/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send(fistProperty)

            const { id, owner } = res.body;
            fistProperty.id = id;
            fistProperty.owner = owner;
            
            expect(owner.id).toBe(1);
            expect(id).toBe(1);
            expect(res.body).toEqual(fistProperty);
    })

    it('should return 422 when creating a property with incorrect inputs', async () => {
        const error =  {
            description: 'You must provide a description.', 
            location: 'You must provide a location.', 
            name: 'You must provide a name.', 
            price: 'You must provide a price', 
            size: 'You must provide a size.'
        }

        const res = await request(app)
            .post('/properties/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send({})
            .expect(422);

            expect(res.body).toEqual(error);
    })

    
    it('should return 422 when creating a property with incorrect inputs', async () => {
        const error =  {
            description: 'You must provide a description.', 
            location: 'You must provide a location.', 
            name: 'You must provide a name.', 
            price: 'You must provide price as a number.', 
            size: 'You must provide a size.'
        }

        const res = await request(app)
            .post('/properties/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send({price: 'text'})
            .expect(422);

            expect(res.body).toEqual(error);
    })

    it('should create properties when user is admin', async () => {
        secondProperty.owner = updatedSecondUser;
        thirdProperty.owner = updatedFirstUser;
        forthProperty.owner = updatedFirstUser;

        const res = await request(app)
            .post('/properties/auth/createMany')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send({ properties: [secondProperty, thirdProperty, forthProperty] })
            .expect(200);

            const [{id: secondId}, {id: thirdId}, {id: forthId}] = res.body;

            secondProperty.id = secondId;
            thirdProperty.id = thirdId;
            forthProperty.id = forthId;

            expect(secondId).toBe(2);
            expect(thirdId).toBe(3);
            expect(forthId).toBe(4);
            expect(res.body).toEqual([secondProperty, thirdProperty, forthProperty]);
    })

    it('should return 401 when creating properties with user that is not admin', async () => {
        const res = await request(app)
            .post('/properties/auth/createMany')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send({ properties: [secondProperty, thirdProperty] })
            .expect(401);

            expect(res.text).toEqual('Unauthorized.');
    })

    it('should return 422 when creating properties with incorrect input', async () => {
        const error = {
            properties0: {
                description: 'You must provide a description.', 
                location: 'You must provide a location.', 
                name: 'You must provide a name.', 
                price: 'You must provide a price', 
                size: 'You must provide a size.'
            }
        }
        const res = await request(app)
            .post('/properties/auth/createMany')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send({ properties: [{}] })
            .expect(422);

            expect(res.body).toEqual(error);
    })

    it('should return 422 when creating properties with incorrect input', async () => {
        const error = {
            properties0: {
                description: 'You must provide a description.', 
                location: 'You must provide a location.', 
                name: 'You must provide a name.', 
                price: 'You must provide price as a number.', 
                size: 'You must provide a size.'
            }
        }
        const res = await request(app)
            .post('/properties/auth/createMany')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send({ properties: [{price: 'text'}] })
            .expect(422);

            expect(res.body).toEqual(error);
    })

    it('should get a property with id: 1', async () => {
        const res = await request(app)
            .get('/properties/findById/1')
            .expect(200);

            expect(res.body).toEqual(fistProperty)
    })

    
    it('should return 404 when findById with nonexistent id', async () => {
        const res = await request(app)
            .get('/properties/findById/222')
            .expect(404);

            expect(res.text).toEqual('Could not find any entity of type "Property" matching: {\n    "id": "222"\n}')
    })

    it('should update property', async () => {
        const res = await request(app)
            .patch('/properties/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send(updatedFirstProperty)
            .expect(200);

            updatedFirstProperty.owner = res.body.owner;

            expect(res.body).toEqual(updatedFirstProperty);
    })

    it('should return 401 when updating property from user with different id that is not admin', async () => {
        const res = await request(app)
            .patch('/properties/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', secondToken)
            .send(updatedFirstProperty)
            .expect(401);

            expect(res.text).toEqual('Unauthorized.');
    })

    it('should update property when updating from user with different id that is admin', async () => {
        const res = await request(app)
            .patch('/properties/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send(updatedSecondProperty)
            .expect(200);

            updatedSecondProperty.owner = res.body.owner;

            expect(res.body).toEqual(updatedSecondProperty);
    })

    it('should return 422 when updating with invalid inputs', async () => {
        const error =  {
            id: 'You must provide an id.', 
            description: 'You must provide a description.', 
            location: 'You must provide a location.', 
            name: 'You must provide a name.', 
            price: 'You must provide a price', 
            size: 'You must provide a size.'
        }

        const res = await request(app)
            .patch('/properties/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send({})
            .expect(422);

            expect(res.body).toEqual(error);
    })

    it('should return 422 when updating with invalid inputs', async () => {
        const error =  {
            id: 'You must provide id as a whole number.',
            description: 'You must provide a description.', 
            location: 'You must provide a location.', 
            name: 'You must provide a name.', 
            price: 'You must provide price as a number.', 
            size: 'You must provide a size.'
        }

        const res = await request(app)
            .patch('/properties/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send({id: 'text', price: 'text'})
            .expect(422);

            expect(res.body).toEqual(error);
    })

    it('should return 401 when deleting property wtihout token', async() => {
        const res = await request(app)
            .delete('/propeprties/auth/delete/1')
            .expect(401);

            expect(res.text).toBe('No auth token');
    })

    it('should return 401 when deleting property with incorrect token', async() => {
        const res = await request(app)
            .delete('/propeprties/auth/delete/1')
            .set('Authorization', 'Bearer incorrect token')
            .expect(401);

            expect(res.text).toBe('jwt malformed');
    })

    it('should return 401 when updating property wtihout token', async() => {
        const res = await request(app)
            .patch('/propeprties/auth/update')
            .set('Content-Type', 'Application/json')
            .expect(401);

            expect(res.text).toBe('No auth token');
    })

    it('should return 401 when updating property with incorrect token', async() => {
        const res = await request(app)
            .patch('/propeprties/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', 'Bearer incorrect token')
            .expect(401);

            expect(res.text).toBe('jwt malformed');
    })

    it('should return 401 when creating property wtihout token', async() => {
        const res = await request(app)
            .post('/propeprties/auth/create')
            .set('Content-Type', 'Application/json')
            .expect(401);

            expect(res.text).toBe('No auth token');
    })

    it('should return 401 when creating property with incorrect token', async() => {
        const res = await request(app)
            .post('/propeprties/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', 'Bearer incorrect token')
            .expect(401);

            expect(res.text).toBe('jwt malformed');
    })
};
export default propertyTests;