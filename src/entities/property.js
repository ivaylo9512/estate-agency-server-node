import { User } from "./user.js";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class Property{
    @PrimaryGeneratedColumn()
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

    @ManyToOne(() => User, user => user.properties, {
        eager: true
    })
    owner;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt;
    
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt;
}