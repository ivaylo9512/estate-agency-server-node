import { Router } from "express";
import { getToken, getRefreshToken, COOKIE_OPTIONS, refreshExpiry } from '../authentication/jwt.js'
import { refreshSecret } from "../authentication/jwt.js";
import { UserDto } from "../entities/dtos/user-dto.js";
import { RefreshToken } from "../entities/refresh-token.js";
import { getConnection } from 'typeorm'
import { NODE_ENV } from "../app.js";
import { registerValidationRules, registerValidator, createValidationRules, createValidator, updateValidatorRules, updateValidator } from '../validators/users-validator.js'

const router = Router();


router.get('/findById/:id', async(req, res) => {
    res.send(new UserDto(await req.userService.findById(Number(req.params.id))));
})

router.patch('/auth/update', updateValidatorRules(), updateValidator, async(req, res) => {
    res.send(new UserDto(await req.userService.update(req.body, req.foundUser)));
})

router.delete('/auth/delete/:id', async(req, res) => {
    const loggedUser = req.user;

    res.send(await req.userService.delete(Number(req.params.id), loggedUser));
})

router.post('/login', async(req, res) => {
    const user = await req.userService.login(req.body);
    await setTokens(res, user, req);

    res.send(new UserDto(user));
})

router.post('/register', registerValidationRules(), registerValidator, async(req, res) => {
    const user = await req.userService.register(req.body);

    await setTokens(res, user, req);

    res.send(new UserDto(user));
})

router.post('/auth/create', createValidationRules(), createValidator, async(req, res) => {
    const loggedUser = req.user;
    const users = await req.userService.create(req.body.users, loggedUser);
    
    res.send(users.map(user => new UserDto(user)));
})

router.get('/refreshToken', async(req, res) => {
    const { signedCookies: { refreshToken } } = req
    const user = await req.userService.getUserFromToken(refreshToken, refreshSecret);

    const token = getToken(user);
  
    res.header('Access-Control-Expose-Headers', 'Authorization'); 
    res.header('Authorization', token);
    
    res.send();
})

const setTokens = async (res, user, req) => {
    const token = getToken(user)
    const refreshToken = getConnection(NODE_ENV).getRepository(RefreshToken).create({
        token: getRefreshToken(user)
    });

    res.cookie("refreshToken", refreshToken.token, COOKIE_OPTIONS);
    res.header('Access-Control-Expose-Headers', 'Authorization'); 
    res.header('Authorization', token);

    return await req.userService.addToken(user, refreshToken, refreshExpiry / 60 / 60 / 24);
}

export default router;