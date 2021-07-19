import {EntityRepository, Repository} from "typeorm";
import { Property } from "../entities/property.js";

@EntityRepository(Property)
export class PropertyRepository extends Repository{
    findById(id){
        return this.findOneOrFail({ id })
    }

    findByLocation(location){
        return this.find({ location });
    }

    findByName(name){
        return this.findOne({ name });
    }

    findByPriceRange(from, to){
        return this.createQueryBuilder('property')
            .where(`property.price BETWEEN '${from}' AND '${to}'`)
            .getMany();
    }

    createProperty(propertyInput){
        const property = this.create(propertyInput)
        return this.save(property)
    }

    updateProperty(propertyInput){
        return this.update(propertyInput.id, propertyInput);
    }

    deleteProperty(id){
        return this.delete(id);
    }
}