import { Repository, EntityRepository } from "typeorm";
import { User } from "../entities/user.js";

@EntityRepository(User)
export default class UserRepository extends Repository{
    findById(id){
        return this.findOneOrFail({ id });
    }

    updateUser(userInput){
        return this.update(userInput.id, userInput);
    }

    createUser(userInput){
        const user = this.create(userInput)
        return this.save(user);
    }
    deleteByUser(user){
        return this.remove(user);
    }
    deleteById(id){
        return this.delete(id);
    }

}