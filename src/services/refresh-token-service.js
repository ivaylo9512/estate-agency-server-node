import UnauthorizedException from "../exceptions/unauthorized-exception.js";
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

    async create(token, owner){
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.expiryDays);

        return await this.repo.createToken({ token, owner, expiresAt });
    }

    async delete(token){
        try{
            const id = verify(token, this.secret);
            return !!(await this.repo.deleteByToken(token)).affected;
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
        verify(token, this.secret);

        const refreshToken = await this.repo.findOne({ token }, { relations: ['owner'] });
        if(!refreshToken){
            throw new UnauthorizedException('Unauthorized.');
        }

        return refreshToken.owner;
    }
}