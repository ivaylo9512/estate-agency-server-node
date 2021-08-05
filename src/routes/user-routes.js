import { Router } from "express";
import { getToken, getRefreshToken, COOKIE_OPTIONS, refreshExpiry } from '../authentication/jwt.js'
import UserDto from "../entities/dtos/user-dto.js";
import { registerValidationRules, registerValidator, createValidationRules, createValidator, updateValidationRules, updateValidator } from '../validators/users-validator.js'

const router = Router();


router.get('/findById/:id([0-9]+)', async(req, res) => {
    res.send(new UserDto(await req.userService.findById(Number(req.params.id))));
})

router.get('/findByUsername/:username', async(req, res) => {
    res.send(new UserDto(await req.userService.findByUsername(req.params.username)));
})

router.patch('/auth/update', updateValidationRules, updateValidator, async(req, res) => {
    res.send(new UserDto(await req.userService.update(req.body, req.foundUser)));
})

router.delete('/auth/delete/:id([0-9]+)', async(req, res) => {
    res.send(await req.userService.delete(Number(req.params.id), req.user));
})

router.post('/login', async(req, res) => {
    const user = await req.userService.login(req.body);
    await setTokens(res, user, req);

    res.send(new UserDto(user));
})

router.post('/register', registerValidationRules, registerValidator, async(req, res) => {
    const user = await req.userService.register(req.body);

    await setTokens(res, user, req);

    res.send(new UserDto(user));
})

router.post('/auth/create', createValidationRules, createValidator, async(req, res) => {
    const users = await req.userService.create(req.body.users);
    
    res.send(users.map(user => new UserDto(user)));
})

router.get('/refreshToken', async(req, res) => {
    const { signedCookies: { refreshToken } } = req;

    const user = await req.refreshService.getUserFromToken(refreshToken);
    const token = getToken(user);
  
    res.header('Access-Control-Expose-Headers', 'Authorization'); 
    res.header('Authorization', token);
    
    res.send();
})

router.post('/logout', async(req, res) => {
    const { signedCookies: { refreshToken } } = req;

    await req.refreshService.delete(refreshToken);
    res.send(true);
})

const setTokens = async (res, user, req) => {
    const token = getToken(user)
    const refreshToken = getRefreshToken(user);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.header('Access-Control-Expose-Headers', 'Authorization'); 
    res.header('Authorization', token);

    await req.refreshService.create(refreshToken, user);
}

export default router;