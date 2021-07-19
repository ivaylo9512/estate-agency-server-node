import { ExtractJwt, Strategy} from 'passport-jwt'
import passport from 'passport'

export const jwtSecret = process.env.JWT_SECRET
if(typeof jwtSecret === 'undefined'){
    throw new Error('Jwt secret is missing.')
}

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
}

const strategy = new Strategy(opts, (payload, done) => {
    return done(null, {
        id: payload.id,
        role: payload.role
    });
})
passport.use(strategy);
export const verifyUser = passport.authenticate(strategy, { session: false })
