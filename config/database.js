const knex = require("knex");

const connectedKnexData = knex({
  client: "sqlite3",
  connection: {
    filename: "./config/flash_data.db"
  }
});

module.exports = connectedKnexData;