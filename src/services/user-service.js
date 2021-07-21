import UnauthorizedException from "../exceptions/unauthorized-exception.js";
import EntitiyNotFoundException from "../exceptions/enitity-not-found-exception.js";
import argon2 from 'argon2';

export default class UserService{
    constructor(repo){
        this.repo = repo;
    }

    async findById(id){
        return await this.repo.findById(id);
    }

    async register(userInput){
        let { username, password, name, description, location } =  userInput;

        password = await argon2.hash(password);

        const user = {
            username,
            password,
            name,
            description,
            location
        }

        return await this.repo.createUser(user);
    }

    async update(userInput, loggedUser){
        if(userInput.id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        const { id, username, name, description, location } =  userInput;

        const user = {
            id,
            username,
            name,
            username,
            description,
            location,
        }

        const result = await this.repo.updateUser(user);
        if(!result.affected){
            throw new EntitiyNotFoundException(`User with id: ${userInput.id} is not found.`)
        }
        
        return userInput;
    }

    async delete(id, loggedUser){
        if(id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        return await this.repo.saveUser(id)
    }

    async getUserFromToken(token, secret){
        const payload = verify(token, secret);
        
        const user = await this.em.findOne(User, { id: payload.id }, ['refreshTokens'])
        if(!user){
            throw new UnauthorizedException('Unauthorized.');
        }

        const foundToken = !user.refreshTokens.getItems().find(rt => rt.token == token);
        if(!foundToken){
            throw new UnauthorizedException('Unauthorized.');
        }

        return user;
    }

    async addToken(user, token, expiryDays){
        const date = new Date();
        date.setDate(date.getDate() + expiryDays);

        token.expiresAt(date);
        token.owner = user;

        user.refreshTokens = [token];

        await this.repo.save(user);
    }
}