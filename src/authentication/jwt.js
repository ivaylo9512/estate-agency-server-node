import { sign }  from 'jsonwebtoken';
import { DEFAULT_REFRESH_EXPIRY, DEFAULT_JWT_EXPIRY } from '../utils/constants';

export const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
export const jwtSecret = process.env.JWT_SECRET;
export const refreshExpiry = eval(process.env.REFRESH_TOKEN_EXPIRY || DEFAULT_REFRESH_EXPIRY);
const jwtExpiry = eval(process.env.JWT_EXPIRY || DEFAULT_JWT_EXPIRY);

if(typeof jwtSecret === 'undefined' || typeof refreshSecret === 'undefined'){
    throw new Error('Refresh or jwt secrets are missing.');
}

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    signed: true,
    maxAge: refreshExpiry * 1000,
    sameSite: "none",
}
export const getToken = (user) => sign({...user}, 
    jwtSecret, {
        expiresIn: jwtExpiry,
})
export const getRefreshToken = (user) => sign({...user}, 
    refreshSecret, {
        expiresIn: refreshExpiry
})
