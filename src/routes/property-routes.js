import { Router } from 'express';

const router = Router();

router.get('/findById/:id', async(req, res) => {
    res.send(await req.propertyService.findById(req.params.id));
});

router.get('/findByName/:name', async(req, res) => {
    res.send(await req.propertyService.findByName(req.params.name))
});

router.get('/findByPriceRange/:from/:to', async(req, res) => {
    res.send(await req.propertyService.findByPriceRange(req.params.from, req.params.to))
});

router.get('/findByLocation/:location', async(req, res) => {
    res.send(await req.propertyService.findByLocation(req.params.location))
});

router.post('/auth/create', async(req, res) => {
    const user = await req.userService.findById(req.user.id);

    res.send(await req.propertyService.create(req.body, user));
})

router.delete('/auth/delete/:id', async(req, res) => {
    const user = await req.userService.findFyId(req.user.id);
    
    res.send(await req.propertyService.delete(req.params.id, user))
})

router.patch('/auth/update', async(req, res) => {
    const user = await req.userService.findFyId(req.user.id);

    res.send(await req.propertyService.update(req.body, user))
})

export default router
