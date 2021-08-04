import EntitiyNotFoundException from "../exceptions/enitity-not-found-exception";
import UnauthorizedException from "../exceptions/unauthorized-exception.js";

export default class PropertyService{
    constructor(repo){
        this.repo = repo;
    }

    async findById(id) {
        return this.repo.findById(id);
    }

    async findByLocation(location) {
        return this.repo.findByLocation(location);
    }
    async findByPriceRange(from, to, direction) {
        return this.repo.findByPriceRange(from, to, direction);
    }

    async findByName(name) {
        return this.repo.findByName(name);
    }

    async findByWithPage(take, location, bedrooms, fromPrice, toPrice, lastId, direction) {
        return this.repo.findByWithPage(take, location, bedrooms, fromPrice, toPrice, lastId, direction)
    }

    async create(propertyInput, loggedUser) {
        const { name, description, price, size, location, bedrooms } = propertyInput;

        const property = {
            name,
            description,
            price,
            size,
            location,
            bedrooms,
            owner: loggedUser
        }

        return this.repo.createProperty(property);
    }

    async createMany(properties, loggedUser) {
        if(loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.')
        }

        properties = properties.map(property => {
            const { name, description, price, size, location, bedrooms, owner } = property;

            return {
                name,
                description,
                price,
                size,
                location,
                bedrooms,
                owner
            }
        })

        return this.repo.createProperty(properties);
    }

    async update(propertyInput, loggedUser) {
        const property = await this.findById(propertyInput.id);

        if(property.owner.id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        const { name, description, price, location, size, bedrooms } = propertyInput;
        
        property.name = name;
        property.description = description;
        property.price = price;
        property.location = location;
        property.size = size;
        property.bedrooms = bedrooms;

        return this.repo.save(property);
    }

    async delete(id, loggedUser){
        const property = await this.findById(id);

        if(property.owner.id != loggedUser.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.')
        }

        await this.repo.deleteByProperty(property);

        return true;
    }
}