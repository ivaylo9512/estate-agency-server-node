import { PrimaryGeneratedColumn, Column, ManyToOne,CreateDateColumn, UpdateDateColumn, Entity } from "typeorm";
import { User } from "./user";

@Entity()
export class RefreshToken{
    @PrimaryGeneratedColumn()
    id;

    @Column('timestamp')
    expiresAt

    @Column('text')
    token
    
    @ManyToOne(() => User, user => user.refreshTokens, {onDelete: 'CASCADE' })
    owner;

    @CreateDateColumn()
    createdAt;
    
    @UpdateDateColumn()
    updatedAt;
}