import { EntityNotFoundError } from "typeorm";

export default class PropertyService{
    constructor(repo){
        this.repo = repo;
    }

    async findById(id, loggedUser) {
        await this.repo.findOne(id);
    }

    async findByLocation(location) {
        await this.repo.find(location);
    }
    async findByPriceRange(from, to) {
        return await this.repo.findByPriceRange(from, to);
    }

    async findByName(name) {
        return await this.repo.findOne(name);
    }

    async create(propertyInput) {
        return await this.repo.create(propertyInput);
    }

    async update(propertyInput) {
        const result = this.repo.update(propertyInput.id, propertyInput);
        
        if(!result.affected){
            throw new EntityNotFoundError(`Entity with id ${property.id} is not found`);
        }

        return propertyInput;
    }
}