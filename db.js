const { Client } = require("pg");

let client;

if (process.env.NODE_ENV === "test") {
    client = new Client({user: "test",
    password: "K00rus3e4!",
    host: "localhost",
    database: "biztime_test",
    port: 5432
    });
} else {
    client = new Client({
        user: "tf292201",
        password: "password",
        host: "localhost",
        database: "biztime",
        port: 5432
    });
}

client.connect();

module.exports = client;
