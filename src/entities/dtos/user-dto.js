export default class UserDto{
    constructor(user){
        const {id, name, username, location, description, email, role} = user;

        this.id = id;
        this.name = name;
        this.username = username;
        this.location = location;
        this.description = description;
        this.email = email;
        this.role = role
    }
}