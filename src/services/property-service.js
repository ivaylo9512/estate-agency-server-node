import EntitiyNotFoundException from "../exceptions/enitity-not-found-exception";
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
        const { name, description, price, size, location } = propertyInput;

        const property = {
            name,
            description,
            price,
            size,
            location,
            owner: loggedUser
        }

        return await this.repo.createProperty(property);
    }

    async update(propertyInput, loggedUser) {
        const property = await this.findById(propertyInput.id);

        if(property.owner.id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        const { id, name, description, price, location } = propertyInput;
        
        property.name = name;
        property.description = description;
        property.price = price;
        property.location = location;

        const result = await this.repo.save(property);
        if(!result){
            throw new EntitiyNotFoundException(`Property with id ${property.id} is not found`);
        }

        return propertyInput;
    }

    async delete(id, loggedUser){
        const property = await this.findById(id);

        if(property.owner.id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.')
        }

        return await this.repo.deleteByProperty(property);
    }
}