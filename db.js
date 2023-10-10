const { Client } = require("pg");

const connectionString = "postgresql://nanaquansah:1Chriss1@localhost/biztime";

const client = new Client({ connectionString });

client.connect();

module.exports = client;

