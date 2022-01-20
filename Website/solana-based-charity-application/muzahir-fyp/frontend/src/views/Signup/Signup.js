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
import { signup } from "../../services/user.service";
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

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      snack: false,
      snackMessage: "Success",
      snackColor: "",
    };
  }

  signupUser = async (e) => {
    try {
      e.preventDefault();
      const { name, email, password } = e.target;
      let body = {
        name: name.value,
        email: email.value,
        password: password.value,
      };

      let usersignup = await signup(body);
      if (usersignup) this.props.history.push("/login");
    } catch (error) {
      console.log("ERROR ", error);
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
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card profile>
              <form onSubmit={this.signupUser}>
                <CardAvatar profile>
                  {/* <a href="#pablo" onClick={(e) => e.preventDefault()}> */}
                  <img src={stock} alt="..." />
                  {/* </a> */}
                </CardAvatar>
                <CardBody profile>
                  {/* <h4 className={classes.cardTitle}>E - STOCK</h4> */}
                  <p className={classes.description}>
                    POS is based on a smart interface that any retail company
                    can use without difficulty. Because it's extremely flexible,
                    you can configure POS to meet your precise needs. Set up new
                    stores quickly and easily with just an internet connection.
                    Then use your Point of Sale everywhere, anytime. While an
                    internet connection is required to start the Point of Sale,
                    it will stay operational even after complete disconnection.
                  </p>
                  <div>
                    <TextField
                      required
                      type="text"
                      style={{
                        marginBottom: "15px",
                      }}
                      autoFocus
                      margin="dense"
                      id="name"
                      label="Enter your Name"
                    />
                  </div>

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
                    Sign Up
                  </Button>
                </CardBody>
              </form>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(Signup));
