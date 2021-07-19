export default class UnauthorizedException extends Error{
    constructor(message){
        super(message);
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.status = 401;
    }

    statusCode(){
        return this.status;
    }
}