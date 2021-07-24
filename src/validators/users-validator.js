import { check, validationResult } from 'express-validator';

export const registerValidation = async(req, res, next) => {
    const result = validationResult(req);

    if(!result.isEmpty()){
        const errors = result.errors.reduce((errorObject, error) => {
            errorObject[error.param] = error.msg
            return errorObject;
        },{})
        return res.status(422).send(errors)
    }

    const {username, password} = req.body;
    const user = await req.userService.findByUsernameOrEmail(username, password); 
    if(user){
        return res.status(422).send({username: 'User with given username or email already exists.'})
    }

    next()
}
export const registerValidationRules = () => [
    check('email', 'Must be a valid email.').isEmail(),
    check('password', 'Password must be between 10 and 22 characters').isLength({min:10, max: 22}),
    check('username', 'Username must be between 8 and 20 characters').isLength({min:8, max: 20}), 
    check('name', 'You must provide a name.').notEmpty(),
    check('location', 'You must provide a location.').notEmpty(),
    check('description', 'You must provide a description.').notEmpty()
]

export const createValidationRules = () => [
    check('users.*.email', 'Must be a valid email.').isEmail(),
    check('users.*.password', 'Password must be between 10 and 22 characters').isLength({min:10, max: 22}),
    check('users.*.username', 'Username must be between 8 and 20 characters').isLength({min:8, max: 20}), 
    check('users.*.name', 'You must provide a name.').notEmpty(),
    check('users.*.location', 'You must provide a location.').notEmpty(),
    check('users.*.description', 'You must provide a description.').notEmpty()
]
export const createValidation = async(req, res, next) => {
    const result = validationResult(req);

    if(!result.isEmpty()){
        const error = result.errors.reduce((errorObject, error) => {
            const params = error.param.match(/[^\[\].]+/g);
            const user = params[0] + params[1];
            const paramName = params[2];

            errorObject[user] = {
                ...errorObject[user], 
                [paramName]: error.msg
            }

            return errorObject;
        }, {})

        return res.status(422).send(error);
    }

    const error = await req.body.users.reduce(async(errorObject, user, i) => {
        const {username, email} = user;
        const foundUser = await req.userService.findByUsernameOrEmail(username, email);

        const errors = await errorObject;
        if(foundUser){
            errors['user' + i] = {
                username: 'User with given username or email already exists.'
            }
        }
        
        return errors;
    }, {}) 

    if(Object.keys(error).length > 0){
        return res.status(422).send(error);
    }

    next();
}