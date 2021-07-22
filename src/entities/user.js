import { Entity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Column } from "typeorm";
import { Property } from "./property.js";
import { RefreshToken } from "./refresh-token.js";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id;

    @Column('text')
    name;

    @Column('text')
    username;

    @Column('text', { select: false })
    password;

    @Column('text')
    email;

    @Column('text')
    location;

    @Column('text', { default: 'user'})
    role;
    
    @Column('text')
    description;

    @OneToMany(() => Property, property => property.owner, { onDelete: 'CASCADE' })
    properties;

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.owner, {
        eager: true,
        onDelete: 'CASCADE' 
    })
    refreshTokens

    @CreateDateColumn({ type: 'timestamp' })
    createdAt;
    
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt;
}
