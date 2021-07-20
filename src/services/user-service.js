import UnauthorizedException from "../exceptions/unauthorized-exception.js";
import EntitiyNotFoundException from "../exceptions/enitity-not-found-exception.js";

export default class UserService{
    constructor(repo){
        this.repo = repo;
    }

    async findById(id){
        return await this.repo.findById(id);
    }

    async create(userInput){
        const user = {
            username: userInput.username,
            password: userInput.password,
            name: userInput.name,
            username: userInput.username,
            description: userInput.description,
            location: userInput.location,
        }
        return await this.repo.createUser(user);
    }

    async update(userInput, loggedUser){
        if(userInput.id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        const user = {
            username: userInput.username,
            password: userInput.password,
            name: userInput.name,
            username: userInput.username,
            description: userInput.description,
            location: userInput.location,
        }

        const result = await this.repo.updateUser(user);
        if(!result.affected){
            throw new EntitiyNotFoundException(`User with id: ${userInput.id} is not found.`)
        }
        
        return await this.repo.updateUser(userInput);
    }

    async delete(id, loggedUser){
        if(id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        return await this.repo.saveUser(id)
    }
}