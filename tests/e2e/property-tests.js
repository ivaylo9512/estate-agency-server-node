import request from 'supertest';
import { app } from './sequential.test';
import { firstToken, secondToken, adminToken } from './user-tests'

const propertyTests = () => {
    const createProperty = {
        name: 'testProperty',
        description: 'testProperty',
        price: 4000000,
        size: 12000,
        location: 'testLocation'
    }
    const updateProperty = {
        id: 1,
        name: 'testPropertyUpdated',
        description: 'testPropertyUpdated',
        price: 4500000,
        size: 15000,
        location: 'testLocationUpdated'
    }

    it('should create a property', async () => {

        const res = await request(app)
            .post('/properties/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send(createProperty)
            .expect(200);
            
            createProperty.id = res.body.id;
            createProperty.owner = res.body.owner;
            updateProperty.owner = res.body.owner;

            expect(res.body.id).toBe(1);
            expect(res.body).toEqual(createProperty);
    })

    it('should get a property with id: 1', async () => {

        const res = await request(app)
            .get('/properties/findById/1')
            .expect(200);

            expect(res.body).toEqual(createProperty)
    })

    it('should update property', async () => {

        const res = await request(app)
            .patch('/properties/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', firstToken)
            .send(updateProperty)
            .expect(200)

            expect(res.body).toEqual(updateProperty);
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