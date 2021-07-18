import { User } from "./entities/user.js";

export default {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "1234",
    database: "estate-agency",
    entities: [
        __dirname + "/entities/*.js"
    ],
    logging: false
}