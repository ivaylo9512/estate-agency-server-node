import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from "typeorm";
import { Property } from "./property.js";

@Entity()
export class User {
    @PrimaryGeneratedColumn('int')
    id;

    @Column('test')
    username

    @Column('text')
    location;

    @Column('text')
    name;

    @Column('text')
    password;

    @Column('description')
    password;

    @OneToMany(() => RefreshToken, rt => rt.token)
    refreshTokens;
    
    @OneToMany(() => Property, property => property.owner)
    properties;
}
