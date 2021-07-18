import {EntityNotFoundError} from "typeorm";

export default class PropertyService{
    repo;

    constructor(){
        this.repo = repo;
    }

    findById = (id, loggedUser) => {
        await this.repo.findOne(1);
    }

    findByLocation = (location) => {
        await this.repo.find({ location });
    }

    findByPriceRange= (from, to) => {
        return await this.repo.createQueryBuilder('property')
            .where(`property.price BETWEEN '${from}' AND '${to}'`)
            .getMany();
    }

    findByName = (name) => {
        return await this.repo.findOne({ name });
    }

    create = (propertyInput) => {
        return await this.repo.create(propertyInput)
    }

    update = (propertyInput) => {
        const result = await connection.getRepository(User).update(propertyInput.id, propertyInput);
        
        if(!result.affected){
            throw new EntityNotFoundError(`Entity with id ${property.id} is not found`);
        }

        return await this.repo.update(propertyInput.id, propertyInput)
    }
}