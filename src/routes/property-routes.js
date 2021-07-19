import { Router } from 'express';
import { verifyUser } from '../utils/jwt-strategy';
import UnauthorizedException from '../exceptions/unauthorized-exception.js';

const router = Router();

const errorHandler = (err, req, res, next) => {
    res.status(err.status).send(err.message)
}

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
router.post('/create', verifyUser, async(req, res) => {
    const user = await req.userService.findById(req.user.id);

    res.send(await req.propertyService.create(req.body, user));
}, errorHandler)
router.delete('/delete/:id', verifyUser, async(req, res) => {
    const user = await req.userService.findFyId(req.user.id);
    
    res.send(await req.propertyService.delete(req.params.id, user))
}, errorHandler)
router.patch('/update', verifyUser, async(req, res) => {
    const user = await req.userService.findFyId(req.user.id);

    res.send(await req.propertyService.update(req.body, user))
}, errorHandler)

export default router
