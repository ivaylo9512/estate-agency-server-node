import { User } from "./user.js";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class Property{
    @PrimaryGeneratedColumn()
    id;
    
    @Column('text')
    name;

    @Column('bigint')
    price;

    @Column('text')
    description;
    
    @Column('bigint')
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