import { Repository, EntityRepository } from "typeorm";
import { User } from "../entities/user.js";

@EntityRepository(User)
export default class UserRepository extends Repository{
    findById(id){
        return this.findOneOrFail({ id });
    }

    update(userInput){
        return this.updateUser(userInput.id, userInput);
    }

    create(userInput){
        return this.saveUser(userInput);
    }

    delete(id){
        return this.deleteUser(id);
    }

}