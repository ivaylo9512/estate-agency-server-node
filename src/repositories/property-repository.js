import {EntityRepository, Repository} from "typeorm";
import { Property } from "../entities/property.js";

@EntityRepository(Property)
export class PropertyRepository extends Repository{
    findById(){
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

    create(propertyInput){
        return this.save(propertyInput)
    }

    update(propertyInput){
        return this.update(propertyInput.id, propertyInput);
    }

    delete(id){
        return this.delete(id);
    }
}