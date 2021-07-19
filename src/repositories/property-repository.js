import {EntityRepository, Repository} from "typeorm";
import { Property } from "../entities/property.js";

@EntityRepository(Property)
export class PropertyRepository extends Repository{
    findByLocation(location){
        return this.find({ location });
    }
    findById(){
        return this.findOne({ id })
    }
    findByName(name) {
        return this.findOne({ name });
    }
    findByPriceRange(from, to){
        return this.createQueryBuilder('property')
            .where(`property.price BETWEEN '${from}' AND '${to}'`)
            .getMany();
    }

    create(propertyInput){
        return this.create(propertyInput)
    }

    update = (propertyInput) => {
        return this.update(propertyInput.id, propertyInput);
    }
}