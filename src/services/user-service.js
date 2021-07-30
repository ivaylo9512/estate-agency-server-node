import UnauthorizedException from "../exceptions/unauthorized-exception.js";
import argon2 from 'argon2';

export default class UserService{
    constructor(repo){
        this.repo = repo;
    }

    async findById(id){
        return await this.repo.findById(id);
    }
    
    async findByUsername(username){
        return await this.repo.findByUsername(username);
    }

    async findByUsernameOrEmail(username, email){
        return await this.repo.findUserOrClause({username, email}, ['user'])
    }

    async findUsersByUsernameOrEmail(username, email){
        return await this.repo.findUsersOrClause({username, email}, ['user'])
    }

    async login(userInput) {
        let { username, password, email } = userInput; 
        let user = await this.repo.findUserOrClause({ username, email }, 
            ['user', 'user.password'])

        if(!user || !await argon2.verify(user.password, password)){
            throw new UnauthorizedException('Incorrect username, pasword or email.')
        }

        return user;
    }

    async create(users) {
        await Promise.all(users.map(async user => 
            user.password = await argon2.hash(user.password)));

        return await this.repo.createUser(users)
    }

    async register(userInput){
        let { username, password, name, description, location, email } =  userInput;

        password = await argon2.hash(password);

        const user = {
            username,
            password,
            name,
            description,
            location,
            email
        }

        return await this.repo.createUser(user);
    }

    async update(userInput, foundUser){
        const { username, name, description, location, email } =  userInput;

        foundUser.username = username;
        foundUser.email = email;
        foundUser.name = name;
        foundUser.description = description;
        foundUser.location = location;

        return await this.repo.save(foundUser);
    }

    async delete(id, loggedUser){
        if(id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        const result = await this.repo.deleteById(id);
        if(!result.affected){
            return false;
        }
        
        return !!result.affected;
    }

    async verifyLoggedUser(id){
        if(!id){
            throw new UnauthorizedException('Unauthorized');
        }

        const user = await this.repo.findOne({ id });

        if(!user){
            throw new UnauthorizedException('User from token is unavailable.');
        }

        return user;
    }
}