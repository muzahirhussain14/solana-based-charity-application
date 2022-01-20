const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const routes = require("./routes");
const solana = require("./solana/solana.js");


// Set up the express app
const app = express();

// Log requests to the console.
app.use(logger("dev"));
app.use(cors())

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", routes);

// Setup a default catch-all route that sends back a welcome message in JSON format.
// app.get("*", (req, res) =>
//   res.status(200).send({
//     message: "Welcome to the beginning.",
//   })
// );

// init solana
(async() => {
    console.log('before start');
  
    await solana.initSolana();
    
    // create charity accounts
    await solana.createSolanaAccount();
    await solana.createSolanaAccount();
    await solana.createSolanaAccount();
    
    console.log('after start');
  })();


module.exports = app;

// module.exports = {
//     app,
//     //solana
// };


// Redux
// 