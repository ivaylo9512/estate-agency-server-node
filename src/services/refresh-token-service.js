import RefreshTokenService from "./base/refresh-token-service";
import RefreshTokenRepositoryImpl from "../repositories/refresh-token-repository-impl";
import UnauthorizedException from "../expceptions/unauthorized";
import { refreshExpiry, refreshSecret } from "../authentication/jwt";
import { verify } from "jsonwebtoken";

export default class RefreshTokenService{
    constructor(repo){
        this.repo = repo;
        this.expiryDays = refreshExpiry / 60 / 60 / 24
        this.secret = refreshSecret;
    }
    
    async findById(id, loggedUser){
        const refreshToken = await this.repo.findById(id);

        if(loggedUser.id != refreshToken.owner.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        return refreshToken;
    }

    create(token, owner){
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.expiryDays);

        return this.repo.create({ token, owner,  expiresAt });
    }

    async save(token, owner){
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.expiryDays);

        const refreshToken = await this.repo.save({ token, owner, expiresAt });
        await this.repo.flush();

        return refreshToken;
    }

    async delete(token){
        try{
            const id = verify(token, this.secret);

            return !!(await this.repo.deleteById(id)).affected;
        }catch(err){
            return false;
        }
    }

    async deleteById(id, loggedUser){
        const refreshToken = await this.repo.findById(id);
        if(loggedUser.id != refreshToken.owner.id && loggedUser.role != 'admin'){
            throw new UnauthorizedException('Unauthorized.');
        }

        return await this.repo.delete(refreshToken);
    }

    async getUserFromToken(token){
        const payload = verify(token, this.secret);
        
        const refreshToken = await this.repo.findOne({ token }, ['owner']);
        if(!refreshToken){
            throw new UnauthorizedException('Unauthorized.');
        }

        return refreshToken.owner;
    }
}