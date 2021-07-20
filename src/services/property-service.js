import { EntitiyNotFoundException } from "typeorm";
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
        const { name, description, price, location } = propertyInput;

        const property = {
            name,
            description,
            price,
            location,
            owner: loggedUser.id
        }

        return await this.repo.createProperty(property);
    }

    async update(propertyInput) {
        const { id, name, description, price, location } = propertyInput;
        
        const property = {
            id,
            name,
            description,
            price,
            location,
        }

        const result = this.repo.updateProperty(propertyInput.id, propertyInput);
        if(!result.affected){
            throw new EntitiyNotFoundException(`Property with id ${property.id} is not found`);
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