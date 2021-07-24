import { check, validationResult } from 'express-validator';

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

export const updateValidatorRules = () => [
    check('id', 'You must provide an id.').notEmpty(),
    check('email', 'Must be a valid email.').isEmail(),
    check('username', 'Username must be between 8 and 20 characters').isLength({min:8, max: 20}), 
    check('name', 'You must provide a name.').notEmpty(),
    check('location', 'You must provide a location.').notEmpty(),
    check('description', 'You must provide a description.').notEmpty()
]

export const registerValidator = async(req, res, next) => {
    if(checkForInputErrors(req, res)){
        return;
    }

    if(await checkForUsernameAndEmail(req, res)){
        return;
    }

    next()
}

export const createValidator = async(req, res, next) => {
    if(checkForArrayInputErrors(req, res)){
        return;
    }

    if(await checkForUsernamesAndEmails(req, res)){
        return;
    }

    next();
}

export const updateValidator = async(req, res, next) => {
    const loggedUser = req.user;
    const userInput = req.body;

    if(userInput != loggedUser.id && loggedUser.role != 'admin'){
        res.status(401).send('Unauthorized.');
    }

    if(checkForInputErrors()){
        return;
    }

    if(!await getUserOrFail(req, res)){
        return;
    }

    if(await validateUpdateUsername(user.username, req, res)){
        return;
    }
    
    req.foundUser = user;
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

const checkForUsernamesAndEmails = async(req, res) => {
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
        res.status(422).send(error);
        return errors;
    }
}

const checkForUsernameAndEmail = async(req, res) => {
    const {username, email} = req.body;
    const user = await req.userService.findByUsernameOrEmail(username, email); 
    if(user){
        res.status(422).send({username: 'User with given username or email already exists.'});
        return user;
    }
}

const validateUpdateUsername = async(oldUsername, req, res) => {
    const newUsername = req.body.username;
    if(oldUsername === newUsername){
        return;
    }

    const user = await req.userService.findByUsername(newUsername);
    if(user){
        res.status(422).send('Username is already in use.')
        return user;
    }
}

const getUserOrFail = async(req, res) => {
    const id = req.body.id;
    const user = await req.userService.findById(id);
    if(!user){
        return res.status(422).send({ id: `User with ${id} doesn't exist`});
    } 
    return user;
}