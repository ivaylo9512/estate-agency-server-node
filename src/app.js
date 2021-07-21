import "reflect-metadata";
import "./utils/load-env.js"
import "@babel/polyfill";
import { createConnection, EntityNotFoundError } from "typeorm";
import ormConfig from './utils/type-orm.js'
import express from 'express';
import multer from 'multer';
import propertyRouter from './routes/property-routes.js'
import PropertyService from "./services/property-service.js";
import { PropertyRepository } from "./repositories/property-repository.js";
import UserRepository from "./repositories/user-repository.js";
import UserService from "./services/user-service.js";
import cors from 'cors';
import { authMiddleware } from './authentication/authenticate.js'

export const initialize = async() => {
    const app = express();

    const connection = await createConnection(ormConfig);
    const propertyService = new PropertyService(connection.getCustomRepository(PropertyRepository))
    const userService = new UserService(connection.getCustomRepository(UserRepository))

    multer({ dest: 'src/public' })
    app.use(express.static('src/public'));

    app.use(cors({
        origin: 'http://localhost:3001'
    }))

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    authMiddleware(app);
    
    app.use('/properties', (req, res, next) => {
        req.propertyService = propertyService;
        req.userService = userService;
        next();
    }, propertyRouter)

    app.use((err, req, res, next) => {
        if(err instanceof EntityNotFoundError){
            err.status = 404;
        }
        res.status(err.status || 500).send(err.message);
    })

    return app
}