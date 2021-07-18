import "reflect-metadata";
import "@babel/polyfill";
import { createConnection } from "typeorm";
import ormConfig from './type-orm.js'
import express from 'express';
import multer from 'multer';

const main = async() => {
    const app = express();

    const connection = await createConnection(ormConfig);

    multer({ dest: 'src/pubil' })
    
    app.use(express.static('src/public'));
    app.use(fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
      }));

    const port = process.env.PORT || 8098;
    app.listen(port, () => {
        console.log(`\n🚀!! server started on http://localhost:${port} !!`)
    })



}
main().catch(err => {
    console.log(err);
})