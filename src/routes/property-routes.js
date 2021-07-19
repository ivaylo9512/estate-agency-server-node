import { Router } from 'express';
import { verifyUser } from '../utils/jwt-strategy';

const router = Router();

router.get('/findById/:id', (req, res) => {
    res.send(req.propertyService.findById(req.params.id));
});
router.get('/findByName/:name', (req, res) => {
    res.send(req.propertyService.findByName(req.params.name))
});
router.get('/findByPriceRange', (req, res) => {
    res.send(req.propertyService.delete(req.body.from, req.body.to))
});
router.get('/findByLocation/:location', (req, res) => {
    res.send(req.propertyService.findByLocation(req.params.location))
});
router.post('/create', verifyUser, (req, res) => {
    const user = req.userService.findFyId(req.user.id);

    res.send(req.propertyService.create(req.body, user));
})
router.delete('/delete/:id', verifyUser, (req, res) => {
    const user = req.userService.findFyId(req.user.id);
    
    res.send(req.propertyService.delete(req.params.id, user))
});
router.patch('/update', verifyUser, (req, res) => {
    const user = req.userService.findFyId(req.user.id);

    res.send(req.propertyService.update(req.body, user))
});

export default router
