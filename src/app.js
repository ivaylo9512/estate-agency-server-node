import "reflect-metadata";
import "./utils/load-env.js"
import "@babel/polyfill";
import { EntityNotFoundError } from "typeorm";
import express from 'express';
import multer from 'multer';
import propertyRouter from './routes/property-routes.js'
import PropertyService from "./services/property-service.js";
import PropertyRepository from "./repositories/property-repository.js";
import UserRepository from "./repositories/user-repository.js";
import RefreshTokenRepository from "./repositories/refresh-token-repository.js";
import UserService from "./services/user-service.js";
import cors from 'cors';
import { authMiddleware } from './authentication/authenticate.js'
import { createTypeorm } from './utils/create-typeorm.js'
import userRoutes from "../dist/routes/user-routes.js";
import cookieParser from 'cookie-parser';
import RefreshTokenService from "./services/refresh-token-service.js";

export const NODE_ENV = process.env.NODE_ENV;

export const initialize = async() => {
    const app = express();
    
    const orm = await createTypeorm(NODE_ENV);

    const propertyService = new PropertyService(orm.getCustomRepository(PropertyRepository))
    const userService = new UserService(orm.getCustomRepository(UserRepository))
    const refreshService = new RefreshTokenService(orm.getCustomRepository(RefreshTokenRepository))

    multer({ dest: 'src/public' })
    app.use(express.static('src/public'));

    app.use(cors({
        origin: 'http://localhost:3001',
        credentials: true
    }))

    app.use(cookieParser(process.env.COOKIE_SECRET));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    authMiddleware(app, userService);
    
    app.use('/properties', (req, res, next) => {
        req.propertyService = propertyService;
        req.userService = userService;
        next();
    }, propertyRouter)

    app.use('/users', (req, res, next) => {
        req.userService = userService;
        req.refreshService = refreshService;
        next();
    }, userRoutes)

    app.use((err, req, res, next) => {
        if(err instanceof EntityNotFoundError){
            err.status = 404;
        }
        res.status(err.status || 500).send(err.message);
    })

    return {
        app, 
        orm
    };
}