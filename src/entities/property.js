import { User } from "./user.js";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'

@Entity()
export class Property{
    @PrimaryGeneratedColumn('int')
    id;
    
    @Column('text')
    name;

    @Column('int')
    price;

    @Column('text')
    description;

    @Column('int')
    size;

    @Column('text')
    location;

    @ManyToOne(() => User, user => user.properties)
    owner

}