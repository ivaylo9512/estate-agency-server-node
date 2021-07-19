import { Entity, PrimaryColumn, OneToMany } from "typeorm";
import { Property } from "./property.js";

@Entity()
export class User {
    @PrimaryColumn('int')
    id;

    @OneToMany(() => Property, property => property.owner)
    properties;
}
