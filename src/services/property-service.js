import { EntityNotFoundError } from "typeorm";
import UnauthorizedException from "../exceptions/unauthorized-exception.js";

export default class PropertyService{
    constructor(repo){
        this.repo = repo;
    }

    async findById(id) {
        return await this.repo.findById(id);
    }

    async findByLocation(location) {
        return await this.repo.findByLocation(location);
    }
    async findByPriceRange(from, to) {
        return await this.repo.findByPriceRange(from, to);
    }

    async findByName(name) {
        return await this.repo.findByName(name);
    }

    async create(propertyInput, loggedUser) {
        propertyInput.owner = loggedUser.id;

        return await this.repo.createProperty(propertyInput);
    }

    async update(propertyInput) {
        const result = this.repo.updateProperty(propertyInput.id, propertyInput);
        
        if(!result.affected){
            throw new EntityNotFoundError(`Entity with id ${property.id} is not found`);
        }

        return propertyInput;
    }

    async delete(id, loggedUser){
        const property = this.findById();

        if(property.owner.id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.')
        }

        return await this.repo.deleteProperty(id);
    }
}