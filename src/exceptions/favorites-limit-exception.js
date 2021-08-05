export default class FavouritesLimitException extends Error{
    constructor(){
        super('Favorites limit reached.')
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.status = 422;
    }

    statusCode(){
        return this.status;
    }
}