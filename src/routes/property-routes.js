import { Router } from 'express';
import PropertyDto from '../entities/dtos/property-dto';
import { createValidationRules, createManyValidationRules, updateValidationRules, validator, createManyValidator } from '../validators/properties-validator';

const router = Router();

router.get('/findById/:id([0-9]+)', async(req, res) => {
    res.send(new PropertyDto(await req.propertyService.findById(req.params.id)));
});

router.get('/findByName/:name', async(req, res) => {
    res.send((await req.propertyService.findByName(req.params.name))
        .map(property => new PropertyDto(property)));
});

router.get('/findByPriceRange/:from([0-9]+)/:to([0-9]+)', async(req, res) => {
    res.send((await req.propertyService.findByPriceRange(req.params.from, req.params.to))
        .map(property => new PropertyDto(property)));
});

router.get('/findByLocation/:location', async(req, res) => {
    res.send((await req.propertyService.findByLocation(req.params.location))
        .map(property => new PropertyDto(property)));
});

router.post('/auth/create', createValidationRules, validator,  async(req, res) => {
    res.send(new PropertyDto(await req.propertyService.create(req.body, req.user)));
})

router.get('/findByWithPage/:take([0-9]+)/:skip([0-9]+)/:location/:fromPrice([0-9]+)/:toPrice([0-9]+)/:direction(?:DESC|ASC)', async(req, res) => {
    const {take, skip, location, fromPrice, toPrice, direction} = req.params;
    const [ properties, count ] = await req.propertyService.findByWithPage(take, skip, location, fromPrice, toPrice, direction);

    res.send({
        count,
        properties: properties.map(property => new PropertyDto(property))
    })
})

router.post('/auth/createMany', createManyValidationRules, createManyValidator,  async(req, res) => {
    const properties = (await req.propertyService.createMany(req.body.properties, req.user))
        .map(property => new PropertyDto(property))
    
    res.send(properties);
})

router.delete('/auth/delete/:id([0-9]+)', async(req, res) => {
    res.send(await req.propertyService.delete(req.params.id, req.user));
})

router.patch('/auth/update', updateValidationRules, validator, async(req, res) => {
    res.send(new PropertyDto(await req.propertyService.update(req.body, req.user)));
})

export default router
