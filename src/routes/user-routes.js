import { Router, Response, ErrorRequestHandler  } from "express";
import UnauthorizedException from "../expceptions/unauthorized";
import { verifyUser } from "../authentication/jwt-strategy";

const router = Router();


router.get('/findById/:id', async(req, res) => {
    const loggedUser = req.user;
    if(!loggedUser){
        throw new UnauthorizedException('Unauthorized.');
    }

    res.send(await req.service?.findById(Number(req.params.id), loggedUser));
})

router.patch('/auth/update', async(req, res) => {
    const loggedUser = req.user;
    if(!loggedUser){
        throw new UnauthorizedException('Unauthorized.');
    }

    res.send(await req.service?.update(req.body, loggedUser));
})

router.delete('/auth/delete/:id', verifyUser, async(req, res) => {
    const loggedUser = req.user;
    if(!loggedUser){
        throw new UnauthorizedException('Unauthorized.');
    }

    res.send(await req.service?.delete(Number(req.params.id), loggedUser));
}, errorHandler)

router.post('/login', async(req, res) => {
    const userResponse = await req.service?.login(req.body);
    const user = userResponse?.user;

    if(user){
        setTokens(res, user, req);
    }

    res.send(userResponse);
})
router.post('/register', async(req, res) => {
    const userResponse = await req.service?.register(req.body);
    const user = userResponse?.user;
    
    if(user){
        setTokens(res, user, req);
    }

    res.send(userResponse);
})

export default router;