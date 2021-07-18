import {getManager, EntityNotFoundError} from "typeorm";

export class PropertyService{
    repo;

    constructor(repo){
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
}