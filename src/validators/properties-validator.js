import { check, validationResult } from 'express-validator';

export const createValidationRules = [
    check('size', 'You must provide a size.').notEmpty(),
    check('price', 'You must provide a price').notEmpty().bail().isNumeric().withMessage('You must provide price as a number.'), 
    check('name', 'You must provide a name.').notEmpty(),
    check('location', 'You must provide a location.').notEmpty(),
    check('description', 'You must provide a description.').notEmpty()
]

export const createManyValidationRules = [
    check('properties.*.size', 'You must provide a size.').notEmpty(),
    check('properties.*.price', 'You must provide a price').notEmpty().bail().isNumeric().withMessage('You must provide price as a number.'), 
    check('properties.*.name', 'You must provide a name.').notEmpty(),
    check('properties.*.location', 'You must provide a location.').notEmpty(),
    check('properties.*.description', 'You must provide a description.').notEmpty()
]

export const updateValidationRules = [
    check('id', 'You must provide an id.').notEmpty().bail().isInt().withMessage('You must provide id as a whole number.'),
    check('size', 'You must provide a size.').notEmpty(),
    check('price', 'You must provide a price').notEmpty().bail().isNumeric().withMessage('You must provide price as a number.'), 
    check('name', 'You must provide a name.').notEmpty(),
    check('location', 'You must provide a location.').notEmpty(),
    check('description', 'You must provide a description.').notEmpty()
]

export const validator = (req, res, next) => {
    if(checkForInputErrors(req, res)){
        return;
    }

    next()
}

export const createManyValidator = (req, res, next) => {
    if(checkForArrayInputErrors(req, res)){
        return;
    }

    next()
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