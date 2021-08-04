import UserDto from "./user-dto.js";

export default class PropertyDto{
    constructor(property){
        const {id, name, price, size, description, location, owner, bedrooms} = property;

        this.id = id
        this.name = name;
        this.price = price;
        this.size = size;
        this.bedrooms = bedrooms;
        this.description = description;
        this.location = location;
        this.owner = new UserDto(owner);
    }
}