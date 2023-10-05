const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://nanaquansah:1Chriss1@localhost/biztime"
});

client.connect();

module.exports = client;
