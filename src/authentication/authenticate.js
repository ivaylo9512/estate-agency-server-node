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


export const authMiddleware = (app, userService) => {
    app.use('**/auth', (req, res, next) => {
        passport.authenticate(strategy, { session: false }, async (error, user, info, status) => {
            if(info){
                return res.status(401).send(info.message)
            }

            try{
                req.user = await userService.verifyLoggedUser(user.id);
            }catch(err){
                return res.status(err.status || 500).send(err.message)
            }
            
            return next();
        })(req, res, next)
    })
}
