import { Repository, EntityRepository } from "typeorm";
import { User } from "../entities/user.js";

@EntityRepository(User)
export default class UserRepository extends Repository{
    findById(id){
        return this.findOneOrFail({ id });
    }

    findByUsername(username){
        return this.findOne({ username });
    }

    findUser(user){
        return this.findOne(user);
    }

    findUserOrClause(user, selections){
        const clause = Object.keys(user).map((key) => `user.${key} = :${key}`).join(' OR ');
        
        return this.createQueryBuilder('user')
            .where(clause , user)
            .select(selections)
            .getOne();
    }

    findUsersOrClause(user, selections){
        const clause = Object.keys(user).map((key) => `user.${key} = :${key}`).join(' OR ');
        
        return this.createQueryBuilder('user')
            .where(clause , user)
            .select(selections)
            .getMany();
    }

    updateUser(userInput){
        return this.update(userInput.id, userInput);
    }
    
    createUser(userInputs){
        const users = this.create(userInputs);
        return this.save(users);
    }
    
    deleteByUser(user){
        return this.remove(user);
    }
    deleteById(id){
        return this.delete(id);
    }

}