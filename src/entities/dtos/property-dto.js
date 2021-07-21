import { UserDto } from "./user-dto.js";

export class PropertyDto{
    constructor(property){
        const {id, name, price, size, description, location, owner} = property;

        this.id = id
        this.name = name;
        this.price = price;
        this.size = size;
        this.description = description;
        this.location = location;
        this.location = new UserDto(owner);
    }
}