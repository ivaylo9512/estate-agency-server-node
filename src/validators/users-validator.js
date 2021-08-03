import { check, validationResult } from 'express-validator';

export const registerValidationRules = [
    check('email', 'Must be a valid email.').isEmail(),
    check('password', 'Password must be between 10 and 22 characters').isLength({min:10, max: 22}),
    check('username', 'Username must be between 8 and 20 characters').isLength({min:8, max: 20}), 
    check('name', 'You must provide a name.').notEmpty(),
    check('location', 'You must provide a location.').notEmpty(),
    check('description', 'You must provide a description.').notEmpty()
]

export const createValidationRules = [
    check('users.*.email', 'Must be a valid email.').isEmail(),
    check('users.*.password', 'Password must be between 10 and 22 characters').isLength({min:10, max: 22}),
    check('users.*.username', 'Username must be between 8 and 20 characters').isLength({min:8, max: 20}), 
    check('users.*.name', 'You must provide a name.').notEmpty(),
    check('users.*.location', 'You must provide a location.').notEmpty(),
    check('users.*.description', 'You must provide a description.').notEmpty(),
    check('users.*.role', 'You must provide a role.').notEmpty().bail().isIn(['user', 'admin']).withMessage('Role must be user or admin.')
]

export const updateValidationRules = [
    check('id', 'You must provide an id.').notEmpty().bail().isInt().withMessage('You must provide id as a whole number.'),
    check('email', 'Must be a valid email.').isEmail(),
    check('username', 'Username must be between 8 and 20 characters').isLength({min:8, max: 20}), 
    check('name', 'You must provide a name.').notEmpty(),
    check('location', 'You must provide a location.').notEmpty(),
    check('description', 'You must provide a description.').notEmpty()
]

export const registerValidator = async(req, res, next) => {
    if(checkForInputErrors(req, res) || await validateCreateUsernameAndEmail(req, res)){
        return;
    }

    next()
}

export const createValidator = async(req, res, next) => {
    if(req.user.role != 'admin'){
        return res.status(401).send('Unauthorized.');
    }

    if(checkForArrayInputErrors(req, res) || await validateCreateUsernamesAndEmails(req, res)){
        return;
    }

    next();
}

export const updateValidator = async(req, res, next) => {
    if(req.body.id != req.user.id && req.user.role != 'admin'){
        return res.status(401).send('Unauthorized.');
    }

    if(checkForInputErrors(req, res) || !await getUserOrFail(req, res) || await validateUpdateUsernameAndEmail(req, res)){
        return;
    }

    next();
}

const checkForInputErrors = (req, res) => {
    const result = validationResult(req);

    if(!result.isEmpty()){
        const errors = result.errors.reduce((errorObject, error) => {
            errorObject[error.param] = error.msg;
            
            return errorObject;
        }, {})

        res.status(422).send(errors);
        return errors;
    }
}

const checkForArrayInputErrors = (req, res) => {
    const result = validationResult(req);

    if(!result.isEmpty()){
        const errors = result.errors.reduce((errorObject, error) => {
            const params = error.param.match(/[^\[\].]+/g);
            const user = params[0] + params[1];
            const paramName = params[2];

            errorObject[user] = {
                ...errorObject[user], 
                [paramName]: error.msg
            }

            return errorObject;
        }, {})

        res.status(422).send(errors);
        return errors;
    }
}

const validateCreateUsernamesAndEmails = async(req, res) => {
    const error = await req.body.users.reduce(async(errorObject, user, i) => {
        const {username, email} = user;
        const foundUser = await req.userService.findUsersByUsernameOrEmail(username, email);
        const errors = await errorObject;
        
        return foundUser.reduce((error, user) => {
            if(username == user.username){
                errors['user' + i] = {
                    username: 'Username is already in use.'
                }
            }
    
            if(email == user.email){
                errors['user' + i] = {
                    email: 'Email is already in use.'
                }
            }
    
            return error
        }, errors); 
    }, {})

    if(Object.keys(error).length > 0){
        res.status(422).send(error);
        return error;
    }
}

const validateCreateUsernameAndEmail = async(req, res) => {
    const {username, email} = req.body;

    const error = (await req.userService.findUsersByUsernameOrEmail(username, email)).reduce((error, user) => {
        if(username == user.username){
            error.username = 'Username is already in use.';
        }

        if(email == user.email){
            error.email = 'Email is already in use.';

        }
        return error
    }, {}); 

    if(Object.keys(error).length > 0){
        res.status(422).send(error);
        return error;
    }
}

const validateUpdateUsernameAndEmail = async(req, res) => {
    const { id, username, email } = req.body;

    const error = (await req.userService.findUsersByUsernameOrEmail(username, email)).reduce((error, user) => {
        if(user.id != id){
            if(username == user.username){
                error.username = 'Username is already in use.';
            }

            if(email == user.email){
                error.email = 'Email is already in use.';

            }
        }
        return error
    }, {});

    if(Object.keys(error).length > 0){
        res.status(422).send(error);
        return error;
    }
}

const getUserOrFail = async(req, res) => {
    const id = req.body.id;
    const user = await req.userService.findById(id);
    if(!user){
        return res.status(422).send({ id: `User with ${id} doesn't exist`});
    } 

    req.foundUser = user;
    return user;
}