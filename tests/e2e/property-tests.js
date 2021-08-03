import request from 'supertest';
import { app } from './sequential.test';
import { secondToken, thirdToken, adminToken, updatedSecondUser, updatedThirdUser } from './user-tests'

const propertyTests = () => {
    const [firstProperty, secondProperty, thirdProperty, forthProperty, ...properties] = Array.from({length: 7}, (v, i) => ({
        name: 'testProperty' + i,
        description: 'testProperty' + i,
        price: `${4000000 * (i + 1)}`,
        size: `${12000 * (i + 1)}`,
        location: 'testLocation'
    }));
    
    const [updatedFirstProperty, updatedSecondProperty] = Array.from({length: 2}, (v, i) => ({
        id: i + 1,
        name: 'testPropertyUpdated' + i,
        description: 'testPropertyUpdated' + i,
        price: 4500000 * (i + 1),
        size: 15000 * (i + 1), 
        location: 'testLocationUpdated'
    }))

    it('should create a property', async () => {
        const res = await request(app)
            .post('/properties/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', secondToken)
            .send(firstProperty)
            .expect(200);

        const { id, owner } = res.body;
        firstProperty.id = id;
        firstProperty.owner = owner;
        
        expect(owner.id).toBe(2);
        expect(id).toBe(1);
        expect(res.body).toEqual(firstProperty);
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
            .set('Authorization', secondToken)
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
            .set('Authorization', secondToken)
            .send({price: 'text'})
            .expect(422);

        expect(res.body).toEqual(error);
    })

    it('should create properties when user is admin', async () => {
        secondProperty.owner = updatedThirdUser;
        const restProperties = [thirdProperty, forthProperty, ...properties].map(property => (property.owner = updatedSecondUser, property));

        const res = await request(app)
            .post('/properties/auth/createMany')
            .set('Content-Type', 'Application/json')
            .set('Authorization', adminToken)
            .send({ properties: [secondProperty, ...restProperties] })
            .expect(200);

        const [{id: secondId}, {id: thirdId}, {id: forthId}] = res.body;

        [secondProperty, ...restProperties].map((property, i) => property.id = res.body[i].id);

        expect(secondId).toBe(2);
        expect(thirdId).toBe(3);
        expect(forthId).toBe(4);
        expect(res.body).toEqual([secondProperty, ...restProperties]);
    })

    it('should return 401 when creating properties with user that is not admin', async () => {
        const res = await request(app)
            .post('/properties/auth/createMany')
            .set('Content-Type', 'Application/json')
            .set('Authorization', secondToken)
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
            .set('Authorization', secondToken)
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
            .set('Authorization', secondToken)
            .send({ properties: [{price: 'text'}] })
            .expect(422);

        expect(res.body).toEqual(error);
    })

    it('should get a property with id: 1', async () => {
        const res = await request(app)
            .get('/properties/findById/1')
            .expect(200);

        expect(res.body).toEqual(firstProperty)
    })
    
    it('should return 404 when findById with nonexistent id', async () => {
        const res = await request(app)
            .get('/properties/findById/222')
            .expect(404);

        expect(res.text).toEqual('Could not find any entity of type "Property" matching: {\n    "id": "222"\n}')
    })

    it('should return properties when findByWithPage in asc order', async() => {
        const res = await request(app)
            .get('/properties/findByWithPage/12/0/testLocation/4000000/14500000/ASC')
            .set('Authorization', adminToken)
            .expect(200);
            
        expect(res.body).toEqual({
            count: 3, 
            properties: [firstProperty, secondProperty, thirdProperty]
        })
    })

    it('should return properties when findByWithPage in desc order', async() => {
        const res = await request(app)
            .get('/properties/findByWithPage/12/0/testLocation/4000000/14500000/DESC')
            .set('Authorization', adminToken)
            .expect(200);

        expect(res.body).toEqual({
            count: 3, 
            properties: [firstProperty, secondProperty, thirdProperty]
        })
    })

    it('should return 0 properties when findByWithPage with nonexistent price range', async() => {
        const res = await request(app)
            .get('/properties/findByWithPage/12/0/testLocation/0/1000/ASC')
            .set('Authorization', adminToken)
            .expect(200);
            
        expect(res.body).toEqual({
            count: 0, 
            properties: []
        })
    })

    it('should return 0 properties when findByWithPage with nonexistent location', async() => {
        const res = await request(app)
            .get('/properties/findByWithPage/12/0/nonexistent/4000000/14500000/ASC')
            .set('Authorization', adminToken)
            .expect(200);
            
        expect(res.body).toEqual({
            count: 0, 
            properties: []
        })
    })

    it('should return 404 when direction is incorect', async() => {
        const res = await request(app)
            .get('/properties/findByWithPage/12/0/nonexistent/4000000/14500000/incorrect')
            .set('Authorization', adminToken)
            .expect(404);
    })

    it('should return 404 when price range is incorrect', async() => {
        const res = await request(app)
            .get('/properties/findByWithPage/12/0/nonexistent/incorrect/incorrect/incorrect')
            .set('Authorization', adminToken)
            .expect(404);
    })

    it('should return 404 when skip is incorect', async() => {
        const res = await request(app)
            .get('/properties/findByWithPage/12/incorrect/nonexistent/4000000/14500000/incorrect')
            .set('Authorization', adminToken)
            .expect(404);
    })

    it('should return 404 when take is incorect', async() => {
        const res = await request(app)
            .get('/properties/findByWithPage/incorrect/0/nonexistent/4000000/14500000/incorrect')
            .set('Authorization', adminToken)
            .expect(404);
    })

    it('should return properties when findByPriceRange', async() => {
        const res = await request(app)
            .get('/properties/findByPriceRange/4000000/14500000')
            .set('Authorization', adminToken)
            .expect(200);
            
        expect(res.body).toEqual([thirdProperty, secondProperty, firstProperty])
    })

    it('should return empty array when findByPriceRange with nonexistent prices', async() => {
        const res = await request(app)
            .get('/properties/findByPriceRange/0/1000')
            .set('Authorization', adminToken)
            .expect(200);

        expect(res.body).toEqual([])
    })

    it('should return 404 when price is incorect', async() => {
        const res = await request(app)
            .get('/properties/findByPriceRange/incorrect/incorrect')
            .set('Authorization', adminToken)
            .expect(404);
    })

    it('should return property when findByName', async() => {
        const res = await request(app)
            .get('/properties/findByName/testProperty1')
            .set('Authorization', adminToken)
            .expect(200);

        expect(res.body).toEqual([secondProperty])
    })

    it('should return empty array when findByName with nonexistent name', async() => {
        const res = await request(app)
            .get('/properties/findByName/nonexistent')
            .set('Authorization', adminToken)
            .expect(200);

        expect(res.body).toEqual([])
    })

    it('should return properties when findByLocation', async() => {
        const res = await request(app)
            .get('/properties/findByLocation/testLocation')
            .set('Authorization', adminToken)
            .expect(200);

        expect(res.body).toEqual([firstProperty, secondProperty, thirdProperty, forthProperty, ...properties])
    })

    it('should return empty array when findByLocation with nonexistent location', async() => {
        const res = await request(app)
            .get('/properties/findByLocation/nonexistent')
            .set('Authorization', adminToken)
            .expect(200);

        expect(res.body).toEqual([])
    })

    it('should update property', async () => {
        const res = await request(app)
            .patch('/properties/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', secondToken)
            .send(updatedFirstProperty)
            .expect(200);

        updatedFirstProperty.owner = res.body.owner;

        expect(res.body).toEqual(updatedFirstProperty);
    })

    it('should return 401 when updating property from user with different id that is not admin', async () => {
        const res = await request(app)
            .patch('/properties/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', thirdToken)
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

    it('should delete property', async() => {
        const res = await request(app)
            .delete('/properties/auth/delete/4')
            .set('Authorization', secondToken)
            .expect(200)

        expect(res.body).toBe(true);
    })

    it('should return 401 when deleting property with owner that has different id and is not role admin', async() => {
        const res = await request(app)
            .delete('/properties/auth/delete/3')
            .set('Authorization', thirdToken)
            .expect(401)

        expect(res.text).toBe('Unauthorized.');
    })

    it('should delete property when deleting property with owner that has different id and is role admin', async() => {
        const res = await request(app)
            .delete('/properties/auth/delete/3')
            .set('Authorization', adminToken)
            .expect(200)

        expect(res.body).toBe(true);
    })

    it('should return 404 when deleting property with nonexistent id', async() => {
        const res = await request(app)
            .delete('/properties/auth/delete/4')
            .set('Authorization', secondToken)
            .expect(404)

        expect(res.text).toBe('Could not find any entity of type "Property" matching: {\n    "id": "4"\n}');
    })

    it('should return 401 when deleting property wtihout token', async() => {
        const res = await request(app)
            .delete('/properties/auth/delete/1')
            .expect(401);

        expect(res.text).toBe('No auth token');
    })

    it('should return 401 when deleting property with incorrect token', async() => {
        const res = await request(app)
            .delete('/properties/auth/delete/1')
            .set('Authorization', 'Bearer incorrect token')
            .expect(401);

        expect(res.text).toBe('jwt malformed');
    })

    it('should return 401 when updating property wtihout token', async() => {
        const res = await request(app)
            .patch('/properties/auth/update')
            .set('Content-Type', 'Application/json')
            .expect(401);

        expect(res.text).toBe('No auth token');
    })

    it('should return 401 when updating property with incorrect token', async() => {
        const res = await request(app)
            .patch('/properties/auth/update')
            .set('Content-Type', 'Application/json')
            .set('Authorization', 'Bearer incorrect token')
            .expect(401);

        expect(res.text).toBe('jwt malformed');
    })

    it('should return 401 when creating property wtihout token', async() => {
        const res = await request(app)
            .post('/properties/auth/create')
            .set('Content-Type', 'Application/json')
            .expect(401);

        expect(res.text).toBe('No auth token');
    })

    it('should return 401 when creating property with incorrect token', async() => {
        const res = await request(app)
            .post('/properties/auth/create')
            .set('Content-Type', 'Application/json')
            .set('Authorization', 'Bearer incorrect token')
            .expect(401);

        expect(res.text).toBe('jwt malformed');
    })
};
export default propertyTests;