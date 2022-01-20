import React from "react";
import { withStyles } from "@material-ui/core/styles";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import TextField from "@material-ui/core/TextField";
import { withRouter } from "react-router-dom";
import { login } from "../../services/user.service";
// import SnackbarCustom from "components/CustomSnackbar/snackbar";
// import { loginUser } from "services/UserService";
// import { setUser } from "services/MemoryService";
import stock from "../../assets/img/mask.png";
const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0",
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
  },
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      snack: false,
      snackMessage: "Success",
      snackColor: "",
    };
  }

  loginUser = async (event) => {
    try {
      event.preventDefault();

      const { email, password } = event.target;
      let body = {
        email: email.value,
        password: password.value,
      };

      if (body.password === "admin") {
        localStorage.setItem("isadmin", "true");
        this.props.history.push("/admin/dashboard");
      } else {
        localStorage.setItem("isadmin", "false");

        let log = await login(body);
        if (log) {
          localStorage.setItem("email", body.email);
          localStorage.setItem("password", body.password);
          this.props.history.push("/admin/dashboard");
        }
      }
    } catch (error) {
      console.log("error ", error);
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div
        style={{
          marginTop: "5em",
          paddingRight: "12em",
          paddingLeft: "12em",
        }}
      >
        {/* <Loader isVisible={this.state.loader}></Loader> */}
        {/* <SnackbarCustom
          message={this.state.snackMessage}
          isVisible={this.state.snack}
          color={this.state.snackColor}
        ></SnackbarCustom> */}

        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card profile>
              <form onSubmit={this.loginUser}>
                <CardAvatar profile>
                  {/* <a href="#pablo" onClick={(e) => e.preventDefault()}> */}
                  <img
                    src={
                      stock
                      // "https://images.unsplash.com/photo-1556742208-999815fca738?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80"
                    }
                    alt="..."
                  />
                  {/* </a> */}
                </CardAvatar>
                <CardBody profile>
                  {/* <h4 className={classes.cardTitle}>E - STOCK</h4> */}
                  {/* <p className={classes.description}>
                    POS is based on a smart interface that any retail company
                    can use without difficulty. Because it's extremely flexible,
                    you can configure POS to meet your precise needs. Set up new
                    stores quickly and easily with just an internet connection.
                    Then use your Point of Sale everywhere, anytime. While an
                    internet connection is required to start the Point of Sale,
                    it will stay operational even after complete disconnection.
                  </p> */}
                  <div>
                    <TextField
                      required
                      type="text"
                      style={{
                        marginBottom: "15px",
                      }}
                      autoFocus
                      margin="dense"
                      id="email"
                      label="Enter your Email"
                    />
                  </div>

                  <div>
                    <TextField
                      required
                      type="password"
                      style={{
                        marginBottom: "15px",
                      }}
                      autoFocus
                      margin="dense"
                      id="password"
                      label="Enter your Password"
                    />
                  </div>
                  <Button type="submit" color="info" round>
                    Login
                  </Button>
                  <div
                    onClick={() => {
                      this.props.history.push("/signup");
                    }}
                  >
                    <p className={classes.description}>
                      Not registered yet ?{" "}
                      <b>
                        <a>Sign Up</a>
                      </b>
                    </p>
                  </div>
                </CardBody>
              </form>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(Login));
