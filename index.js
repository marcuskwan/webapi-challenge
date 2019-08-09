// code away!

// use environment variables
require('dotenv').config()

const server = require("./api/server");

// read port from server environment if it's there... or PORT 8000 .. Heroku will have the PORT environment variable set
const port = process.env.PORT || 8000;

const greeting = "API IS RUNNING AHHHHH!!!!";
server.listen(port, () => {
    console.log(
        `\n*** ${greeting} Server Running on http://localhost:${port} ***\n`
    );
});