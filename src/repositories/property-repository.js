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

    findFavorites(){
        return this.find({ isFavorite: true });
    }

    findByWithPage(take, location, bedrooms, fromPrice, toPrice, lastId, direction){
        const query = this.createQueryBuilder('property')
            .leftJoinAndSelect('property.owner', 'owner')
            .where(`(property.price = '${fromPrice}' AND property.id > '${lastId}' OR property.price > '${fromPrice}' AND property.price < '${toPrice}') AND property.location = '${location}'`)
            .andWhere('owner.id = property.owner')
            .orderBy('property.price', direction)
            .addOrderBy('property.id', 'ASC')
            .take(take);

        if(bedrooms > 0){
            query.andWhere(`property.bedrooms = '${bedrooms}'`)
        }

        return query.getManyAndCount();
    }

    findUserProperties(take, name, lastId, lastName, direction, userId){
        const query = this.createQueryBuilder('property')
            .leftJoinAndSelect('property.owner', 'owner')
            .where(`property.owner = ${userId}`)
            .orderBy('property.name', direction)
            .addOrderBy('property.id', 'ASC')
            .take(take);

        if(name){
            query.andWhere(`property.name = '${name}' AND property.id > '${lastId}'`)
        }else if(lastName != 'undefined'){
            query.andWhere(`(property.name = '${lastName}' AND property.id > '${lastId}') OR property.name ${direction == 'ASC' ? '>' : '<' } '${lastName}'`)
        }else{
            query.andWhere(`property.id > '${lastId}'`)

        }

        query.andWhere(`property.owner = ${userId} AND owner.id = property.owner`)
        return query.getManyAndCount();
    }

    findByPriceRange(from, to, direction){
        return this.createQueryBuilder('property')
            .leftJoinAndSelect('property.owner', 'owner')
            .where(`property.price BETWEEN '${from}' AND '${to}'`)
            .andWhere('owner.id = property.owner')
            .orderBy('property.price', direction)
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