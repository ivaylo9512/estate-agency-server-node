import UnauthorizedException from "../exceptions/unauthorized-exception.js";

export default class UserService{
    constructor(repo){
        this.repo = repo;
    }

    async findById(id){
        return await this.repo.findById(id);
    }

    async create(userInput){
        return await this.repo.save(userInput);
    }

    async update(userInput, loggedUser){
        if(userInput.id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        return await this.repo.update(userInput);
    }

    async delete(id, loggedUser){
        if(id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        return await this.repo.delete(id)
    }
}