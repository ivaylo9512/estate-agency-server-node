export class UserDto{
    constructor(user){
        const {id, name, username, location} = user;

        this.id = id;
        this.name = name;
        this.username = username;
        this.location = location;
    }
}