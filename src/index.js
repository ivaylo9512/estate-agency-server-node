import "reflect-metadata";
import "./utils/load-env.js"
import "@babel/polyfill";
import { createConnection } from "typeorm";
import ormConfig from './type-orm.js'
import express from 'express';
import multer from 'multer';
import propertyRouter from './routes/property-routes.js'
import PropertyService from "./services/property-service.js";

const main = async() => {
    const app = express();

    const connection = await createConnection(ormConfig);

    multer({ dest: 'src/pubilc' })
    app.use(express.static('src/public'));

    app.use('/properties', propertyRouter)

    const port = process.env.PORT || 8098;
    app.listen(port, () => {
        console.log(`\n🚀!! server started on http://localhost:${port} !!`)
    })



}
main().catch(err => {
    console.log(err);
})