import { Repository, EntityRepository } from "typeorm";
import { User } from "../entities/user.js";

@EntityRepository(User)
export default class UserRepository extends Repository{
    findById(id){
        return this.findOneOrFail({ id });
    }

    update(userInput){
        return this.update(userInput.id, userInput);
    }
    
    create(userInput){
        return this.save(userInput);
    }

    delete(id){
        return this.delete(id);
    }

}