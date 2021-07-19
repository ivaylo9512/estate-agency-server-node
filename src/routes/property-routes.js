import { Router } from 'express';
import { verifyUser } from '../utils/jwt-strategy';

const router = Router();

router.get('/findById/:id', verifyUser, (req, res) => {
    res.send(req.service.findFyId(req.params.id));
});
router.get('/findByName/:name', verifyUser, (req, res) => {
    res.send(req.service.findByName(req.params.name))
});
router.get('/findByPriceRange', verifyUser, (req, res) => {
    res.send(req.service.delete(req.body.from, req.body.to))
});
router.get('/findByLocation/:location', verifyUser, (req, res) => {
    res.send(req.service.findByLocation(req.params.location))
});
router.delete('/delete/:id', verifyUser, (req, res) => {
    res.send(req.service.delete(req.params.id))
});
router.patch('/update', verifyUser, (req, res) => {
    res.send(req.service.update(req.body))
});

export default router
