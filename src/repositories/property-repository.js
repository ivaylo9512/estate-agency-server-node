import { EntityRepository, Repository, Between, Like } from "typeorm";
import { Property } from "../entities/property.js";

@EntityRepository(Property)
export default class PropertyRepository extends Repository{
    findById(id){
        return this.findOneOrFail({ id })
    }

    findByLocation(location){
        return this.find({ 
            order: {
                location: 'ASC',
                id: 'ASC'
            },
            where: {
                location: Like(`%${location}%`)
            }
        });
    }

    findByName(name){
        return this.find({ 
            order: {
                name: 'ASC',
                id: 'ASC'
            },
            where: {
                name: Like(`%${name}%`)
            }
        });
    }

    findByWithPage(take, skip, location, fromPrice, toPrice, direction){
        return this.findAndCount(
            { 
                where: { 
                    price: Between(fromPrice, toPrice), 
                    location: Like(`%${location}%`)
                },
                order: { price: direction },
                take,
                skip
            }
        );
    }

    findByPriceRange(from, to){
        return this.createQueryBuilder('property')
            .leftJoinAndSelect('property.owner', 'owner')
            .where(`property.price BETWEEN '${from}' AND '${to}'`)
            .andWhere('owner.id = property.owner')
            .getMany();
    }

    createProperty(propertyInput){
        const property = this.create(propertyInput);
        return this.save(property)
    }

    updateProperty(propertyInput){
        return this.update(propertyInput.id, propertyInput);
    }

    deleteByProperty(property){
        return this.remove(property);
    }

    deleteById(id){
        return this.delete(id);
    }
}