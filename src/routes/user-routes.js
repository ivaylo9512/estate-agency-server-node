import { Router, Response, ErrorRequestHandler  } from "express";
import { UserRequest } from "src/types";
import { getToken, getRefreshToken, COOKIE_OPTIONS, refreshExpiry } from '../authentication/authenticate'
import User from "../entities/user";
import { refreshSecret } from "../authentication/authenticate";
import { JwtUser } from "../authentication/jwt-user";
import UnauthorizedException from "../expceptions/unauthorized";
import { verifyUser } from "../authentication/authenticate";

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


router.get('/refreshToken', async(req, res) => {
    const { signedCookies: { refreshToken } } = req
    
    const user = await req.service.getUserFromToken(refreshToken, refreshSecret);

    const token = getToken(user);

    res.header('Access-Control-Expose-Headers', 'Authorization'); 
    res.header('Authorization', token);
    
    res.send();
})

const setTokens = async (res, user, req) => {
    const token = getToken(new JwtUser(user))
    const refreshToken = getRefreshToken(new JwtUser(user));

    req.service?.addToken(user, refreshToken, refreshExpiry / 60 / 60 / 24)

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.header('Access-Control-Expose-Headers', 'Authorization'); 
    res.header('Authorization', token);
}

export default router;