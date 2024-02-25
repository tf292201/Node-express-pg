const { Client } = require("pg");

const client = new Client({
    user: "tf292201",         // Username
    password: "password",     // Password
    host: "localhost",        // Hostname (optional, defaults to localhost)
    database: "biztime",      // Database name
    port: 5432,               // Port number (optional, defaults to 5432)
});

client.connect();

module.exports = client;
