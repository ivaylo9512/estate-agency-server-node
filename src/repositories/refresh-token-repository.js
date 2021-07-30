import { Repository, EntityRepository } from "typeorm";
import { RefreshToken } from "../entities/refresh-token";

@EntityRepository(RefreshToken)
export default class RefreshTokenRepository extends Repository{
    findById(ider){
        return this.findOneOrFail({ id });
    }

    findByToken(token){
        return this.findOne({ token });
    }

    update(refreshToken){
        return this.nativeUpdate({id: refreshToken.id}, refreshToken);
    }

    createToken(refreshTokenInput){
        const refreshToken = this.create(refreshTokenInput);
      
        return this.save(refreshToken);
    }

    deleteByRefreshToken(token){
        return this.remove(token);
    }

    deleteByToken(token){
        return this.delete({ token });
    }
}