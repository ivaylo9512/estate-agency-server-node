import "reflect-metadata";
import "./utils/load-env.js"
import "@babel/polyfill";
import { createConnection } from "typeorm";
import ormConfig from './type-orm.js'
import express from 'express';
import multer from 'multer';
import propertyRouter from './routes/property-routes'
import PropertyService from "./services/property-service.js";
import {PropertyRepository} from "./repositories/property-repository.js";

const main = async() => {
    const app = express();

    const connection = await createConnection(ormConfig);
    const propertyService = new PropertyService(connection.getCustomRepository(PropertyRepository))

    multer({ dest: 'src/pubilc' })
    app.use(express.static('src/public'));

    app.use('/properties', (req, res, next) => {
        req.service = propertyService;
        next();
    }, propertyRouter)

    const port = process.env.PORT || 8098;
    app.listen(port, () => {
        console.log(`\n🚀!! server started on http://localhost:${port} !!`)
    })



}
main().catch(err => {
    console.log(err);
})