const { Router } = require("express");
const router = Router();
const { UserContoller, AccountController } = require("../controllers");

// User Routes

router.get("/user", async (req, res) => {
  try {
    let data = await UserContoller.getAll();
    res.status(200).send(data);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

router.get("/transaction", async (req, res) => {
  try {
    let data = await UserContoller.getAllTransactions();
    res.status(200).send(data);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

router.post("/user", async (req, res) => {
  try {
    let data = await UserContoller.create(req.body);
    res.status(200).send(data[0].dataValues);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    let data = await UserContoller.login(req.body);
    res.status(200).send(data[0].dataValues);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

router.post("/account", async (req, res) => {
  try {
    let data = await AccountController.create(req.body);
    res.status(200).send(data[0].dataValues);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

router.post("/account/fund", async (req, res) => {
  try {
    let data = await AccountController.createJunction(req.body);
    res.status(200).send(data);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

router.get("/transaction", async (req, res) => {
  try {
    let data = await UserContoller.getAllTransactions();
    res.status(200).send(data);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

router.get("/states", async (req, res) => {
  try {
    let data = await AccountController.getStates();
    let json_string = JSON.stringify(Array.from(data.entries()));

    let map = new Map(JSON.parse(json_string));
    console.log(" ********* STATES DATA TO JSON STRING ********** ", json_string);
    console.log(" ********* STATES DATA TO MAP ********** ", json_string);

    //For the reverse, use
    //map = new Map(JSON.parse(jsonText));

    //res.status(200).send(data);
    res.status(200).send(json_string);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

router.post("/forwardfunds", async (req, res) => {
  try {
    console.log("Calling forward funds operation\n");

    await AccountController.forwardFunds(req.body.from, req.body.to);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

router.post("/setstatesvariable", async (req, res) => {
  try {
    console.log("Calling setStateVariable - \n", req.body.state);

    AccountController.setStatesVariable(req.body.state);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

router.get("/getstatesvariable", async (req, res) => {
  try {
    console.log("Calling getStateVariable\n");

    let data = AccountController.getStatesVariable();

    console.log("getStatesVariable returned: ", data);
    res.status(200).send(data);
  } catch (error) {
    console.log("ERROR ", error);
    res.status(400).send(error);
  }
});

// router.get("/brand", async (req, res) => {
//   try {
//     let data = await BrandController.getAll();
//     res.status(200).send(data);
//   } catch (error) {
//     console.log("ERROR ", error);
//     res.status(400).send(error);
//   }
// });

// router.put("/brand", upload.single("image"), async (req, res) => {
//   try {
//     let data = await BrandController.update(
//       req.query,
//       req.body,
//       req.file ? req.file : null
//     );
//     res.status(200).send(data);
//   } catch (error) {
//     console.log("ERROR ", error);
//     res.status(400).send(error);
//   }
// });

// router.delete("/brand", async (req, res) => {
//   try {
//     let data = await BrandController.delete(req.query);
//     res.status(200).send(data);
//   } catch (error) {
//     console.log("ERROR ", error);
//     res.status(400).send(error);
//   }
// });

router.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to Beginning to Nothingness" });
});

module.exports = router;
