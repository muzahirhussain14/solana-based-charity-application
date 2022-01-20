import React from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Store from "@material-ui/icons/Store";
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import AccessTime from "@material-ui/icons/AccessTime";
import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Tasks from "components/Tasks/Tasks.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import {
  getAllUsers,
  getAllTransactions,
  createTransaction,
  login,
  getStatesAccountData,
  forwardfunds,
  getStatesVariable,
  setStatesVariable
} from "../../services/user.service";

import { bugs, website, server } from "variables/general.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart,
} from "variables/charts.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      transactions: [],
      currentHistory: [],
      transactionState: '',
      amount: 0,
      accountId: null,
      accoundIdDest: null,
      check: false,
      isAdmin: false
    };
  }

  async componentDidMount() {
    try {
      let isadmin = localStorage.getItem("isadmin");

      if (isadmin === "true") {
        let users = await getAllUsers();
        let transactions = await getAllTransactions();

        this.setState({ users, transactions, isAdmin: true });
      } else {
        let email = localStorage.getItem("email");
        let password = localStorage.getItem("password");

        let users = await login({
          email,
          password,
        });

        let x = [];
        x.push(users);

        console.log("X ", x);

        this.setState({ users: x, isAdmin: false});
      }
    } catch (error) {
      console.log("ERROR ", error);
    }
  }

  async getStatesDataFromBlockchain(accountId) { 

    let data = await getStatesAccountData();
    let output = "";

    // iterate through the list and get the required data
    for (let i = 0; i < data.length; i++) {

      if (data[i][0].startsWith(accountId)) 
      {
        let receipient = data[i][0].split("_")[1];
        let amount = parseInt(data[i][1], 16);

        output += accountId + " " + amount + " lamports has been sent to account with ID: " + receipient + "\n";
      }
    }
    console.log("DATA FROM THE FUNCTION: ", output);

    return output;
  }

  async getStatesVariable(accountId) {
    let data = await getStatesVariable();
    let output = "";

    // iterate through the list and get the required data
    for (let i = 0; i < data.length; i++) {

      if (data[i].startsWith(accountId)) 
      {
        let substr = data[i].substring(accountId.length);
        output += substr;
      }
    }
    console.log("DATA FROM THE FUNCTION: ", output);

    return output;
  }


  setStatesVariable = async () => {
    try {
      this.setState({ check: !this.state.check }, async () => {
        
        let body = {
          state: this.state.transactionState
        };

        await setStatesVariable(body);
    });
    } catch (error) {
      console.log("error ", error);
    }
  };

  adminForwardFunds = async () => {
    try {
      this.setState({ check: !this.state.check }, async () => {
        
          let body = {
            from: this.state.accountId,
            to: this.state.accoundIdDest,
          };

          await forwardfunds(body);
      });
    } catch (error) {
      console.log("error ", error);
    }
  };

  createTrans = async ({ userId }) => {
    try {
      this.setState({ check: !this.state.check }, async () => {
        if (this.state.amount > 0 && this.state.accountId) {
          let body = {
            userId,
            accountId: this.state.accountId,
            amount: parseInt(this.state.amount),
          };

          let crt = await createTransaction(body);
          if (crt) {
            let users = await getAllUsers();
            let transactions = await getAllTransactions();
            this.setState({ users, accountId: null, amount: 0, transactions });
          }
        }
      });
    } catch (error) {
      console.log("error ", error);
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <GridContainer>
          { this.state.isAdmin ? (
            <GridItem xs={12} sm={6} md={6}>
              <Card>
                <CardHeader color="warning" stats icon>
                  <CardIcon color="warning">
                    <Icon>content_copy</Icon>
                  </CardIcon>
                  <p className={classes.cardCategory}>Total Transactions</p>
                  <h3 className={classes.cardTitle}>
                    {this.state.transactions.length}
                  </h3>
                </CardHeader>
                <CardFooter stats>
                  <div className={classes.stats}>
                    <Update />
                    Just Updated
                  </div>
                </CardFooter>
              </Card>
            </GridItem>
          ) : null }
          {/* <GridItem xs={12} sm={6} md={3}>
            <Card>
              <CardHeader color="success" stats icon>
                <CardIcon color="success">
                  <Store />
                </CardIcon>
                <p className={classes.cardCategory}>Revenue</p>
                <h3 className={classes.cardTitle}>$34,245</h3>
              </CardHeader>
              <CardFooter stats>
                <div className={classes.stats}>
                  <DateRange />
                  Last 24 Hours
                </div>
              </CardFooter>
            </Card>
          </GridItem> */}
          {/* <GridItem xs={12} sm={6} md={3}>
            <Card>
              <CardHeader color="danger" stats icon>
                <CardIcon color="danger">
                  <Icon>info_outline</Icon>
                </CardIcon>
                <p className={classes.cardCategory}>Fixed Issues</p>
                <h3 className={classes.cardTitle}>75</h3>
              </CardHeader>
              <CardFooter stats>
                <div className={classes.stats}>
                  <LocalOffer />
                  Tracked from Github
                </div>
              </CardFooter>
            </Card>
          </GridItem> */}

          {this.state.isAdmin ? (
            <GridItem xs={12} sm={6} md={6}>
              <Card>
                <CardHeader color="info" stats icon>
                  <CardIcon color="info">
                    <Accessibility />
                  </CardIcon>
                  <p className={classes.cardCategory}>Total Users</p>
                  <h3 className={classes.cardTitle}>
                    {this.state.users.length}
                  </h3>
                </CardHeader>
                <CardFooter stats>
                  <div className={classes.stats}>
                    <Update />
                    Just Updated
                  </div>
                </CardFooter>
              </Card>
            </GridItem>
          ) : null}

        </GridContainer>
        {/* <GridContainer>
          <GridItem xs={12} sm={12} md={4}>
            <Card chart>
              <CardHeader color="success">
                <ChartistGraph
                  className="ct-chart"
                  data={dailySalesChart.data}
                  type="Line"
                  options={dailySalesChart.options}
                  listener={dailySalesChart.animation}
                />
              </CardHeader>
              <CardBody>
                <h4 className={classes.cardTitle}>Daily Sales</h4>
                <p className={classes.cardCategory}>
                  <span className={classes.successText}>
                    <ArrowUpward className={classes.upArrowCardCategory} /> 55%
                  </span>{" "}
                  increase in today sales.
                </p>
              </CardBody>
              <CardFooter chart>
                <div className={classes.stats}>
                  <AccessTime /> updated 4 minutes ago
                </div>
              </CardFooter>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <Card chart>
              <CardHeader color="warning">
                <ChartistGraph
                  className="ct-chart"
                  data={emailsSubscriptionChart.data}
                  type="Bar"
                  options={emailsSubscriptionChart.options}
                  responsiveOptions={emailsSubscriptionChart.responsiveOptions}
                  listener={emailsSubscriptionChart.animation}
                />
              </CardHeader>
              <CardBody>
                <h4 className={classes.cardTitle}>Email Subscriptions</h4>
                <p className={classes.cardCategory}>Last Campaign Performance</p>
              </CardBody>
              <CardFooter chart>
                <div className={classes.stats}>
                  <AccessTime /> campaign sent 2 days ago
                </div>
              </CardFooter>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <Card chart>
              <CardHeader color="danger">
                <ChartistGraph
                  className="ct-chart"
                  data={completedTasksChart.data}
                  type="Line"
                  options={completedTasksChart.options}
                  listener={completedTasksChart.animation}
                />
              </CardHeader>
              <CardBody>
                <h4 className={classes.cardTitle}>Completed Tasks</h4>
                <p className={classes.cardCategory}>Last Campaign Performance</p>
              </CardBody>
              <CardFooter chart>
                <div className={classes.stats}>
                  <AccessTime /> campaign sent 2 days ago
                </div>
              </CardFooter>
            </Card>
          </GridItem>
        </GridContainer> */}
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <CustomTabs
              title=""
              headerColor="primary"
              tabs={[
                // {
                //   tabName: "Bugs",
                //   tabIcon: BugReport,
                //   tabContent: (
                //     <Tasks
                //       checkedIndexes={[0, 3]}
                //       tasksIndexes={[0, 1, 2, 3]}
                //       tasks={bugs}
                //     />
                //   )
                // },
                // {
                //   tabName: "Website",
                //   tabIcon: Code,
                //   tabContent: (
                //     <Tasks
                //       checkedIndexes={[0]}
                //       tasksIndexes={[0, 1]}
                //       tasks={website}
                //     />
                //   )
                // },


                {
                  tabName: "Transaction History",
                  tabIcon: Cloud,
                  tabContent: (
                    <Tasks
                      checkedIndexes={[]}
                      tasksIndexes={(() => {
                        let x = [];
                        this.state.currentHistory.map((m, i) => {
                          x.push(i);
                        });
                        return x;
                      })()}

                      // tasksIndexes={(() => {
                      //   let x = [];
                      //   if (this.state.currentHistory.length > 0) {
                            
                      //     for (let i = 0; i < this.state.currentHistory.length; ++i) {
                      //       let value = this.state.currentHistory.pop();
                      //       x.push(value);
                      //     }
                      //   }
                      //   return x;
                      // })()}

                      tasks={this.state.currentHistory}
                    />
                  ),
                },
              ]}
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="warning">
                <h4 className={classes.cardTitleWhite}>All Users</h4>
                <p className={classes.cardCategoryWhite}>
                  {/* New employees on 15th September, 2016 */}
                </p>
              </CardHeader>
            
            <CardBody>

            { this.state.isAdmin == true ? 
              
              <Table
  
                tableHeaderColor="warning"
                tableHead={[
                  "ID",
                  "Name",
                  "Source Account",
                  "Destination Account",
                  "Create Transaction"
                ]}
  
                tableData={(() => {
                  let data = [];
                  this.state.users.map((user) => {
                    let dat = [];
                    dat.push(user.id);
                    dat.push(user.name);
                    dat.push(
                      <input
                        placeholder="Account ID"
                        onChange={(e) => {
                          this.setState({ accountId: e.target.value });
                        }}
                        type={"text"}
                      />
                    );
                    dat.push(
                      <input
                        placeholder="Account ID"
                        onChange={(e) => {
                          this.setState({ accoundIdDest: e.target.value });
                        }}
                        type={"text"}
                      />
                    );
                    dat.push(
                      <button
                        onClick={() => {
                          console.log("PRESSED");
                          this.adminForwardFunds();
                          //this.createTrans({ userId: user.id });
                        }}
                      >
                    {" "}
                    Send Transaction{" "}
                      </button>
                    );
  
                    data.push(dat);
                  });
  
                  return data;
                })()}
              />
  
                :               
                
              <Table
  
                tableHeaderColor="warning"
                tableHead={[
                  "ID",
                  "Name",
                  "Email",
                  "Amount",
                  "Account ID",
                  "Create Transaction",
                  "Transaction History",
                ]}
                // tableData={[
                //   ["1", "Dakota Rice", "$36,738", "Niger"],
                //   ["2", "Minerva Hooper", "$23,789", "Curaçao"],
                //   ["3", "Sage Rodriguez", "$56,142", "Netherlands"],
                //   ["4", "Philip Chaney", "$38,735", "Korea, South"],
                // ]}
                tableData={(() => {
                  let data = [];
                  this.state.users.map((user) => {
                    let dat = [];
                    dat.push(user.id);
                    dat.push(user.name);
                    dat.push(user.email);
                    dat.push(
                      <input
                        placeholder="Amount"
                        onChange={(e) => {
                          this.setState({ amount: e.target.value });
                        }}
                        type={"number"}
                      />
                    );
                    dat.push(
                      <input
                        placeholder="Account ID"
                        onChange={(e) => {
                          this.setState({ accountId: e.target.value });
                        }}
                        type={"text"}
                      />
                    );
                    dat.push(
                      <button
                        onClick={async () => {
                          console.log("PRESSED");
                          this.createTrans({ userId: user.id });

                          let states_data = await this.getStatesDataFromBlockchain(user.accountId);
                          this.state.transactionState = states_data;
                          await this.setStatesVariable();
                        }}
                      >
                        {" "}
                        Send Transaction{" "}
                      </button>
                    );
                    dat.push(
                      <button
                        onClick={async () => {
                          let ac = [];
                          let updated_data = await this.getStatesDataFromBlockchain(user.accountId);
                          this.state.transactionState = updated_data;
                          
                          let states_data = await this.getStatesVariable(user.accountId);
                          console.log("Data received in SHOW Button is: ", states_data);
                          
                          user.accounts.map((acc) => {
                              ac.push(
                                states_data
                              );
                            });
                          this.setState({ currentHistory: ac });

                          // let ac = [];
                          // let states_data = await this.getStatesDataFromBlockchain(user.accountId);
  
                          // let insert = true;
                          // if (this.state.currentHistory.length > 0) {
                            
                          //   for (let i = 0; i < this.state.currentHistory.length; ++i) {
                          //     let value = this.state.currentHistory.pop();
                          //     ac.push(value);
                          //     if (value === states_data)
                          //       insert = false;
                          //   }
                          // }

                          // if (insert == true) {             // only insert if its a new record
                          //   user.accounts.map((acc) => {
                          //     ac.push(
                          //       states_data
                          //     );
                          //   });
                          //   this.setState({ currentHistory: ac });
                          // }
                        }}
                      >
                        Show{" "}
                      </button>
                    );
  
                    data.push(dat);
                  });
  
                  return data;
                })()}
              />
  
              }

              {
                /*
              <Table

              tableHeaderColor="warning"
              tableHead={[
                "ID",
                "Name",
                "Email",
                "Amount",
                "Account ID",
                "Create Transaction",
                "Transaction History",
              ]}
              // tableData={[
              //   ["1", "Dakota Rice", "$36,738", "Niger"],
              //   ["2", "Minerva Hooper", "$23,789", "Curaçao"],
              //   ["3", "Sage Rodriguez", "$56,142", "Netherlands"],
              //   ["4", "Philip Chaney", "$38,735", "Korea, South"],
              // ]}

              tableData={(() => {
                
                let data = [];
                this.state.users.map((user) => {
                  let dat = [];
                  dat.push(user.id);
                  dat.push(user.name);
                  
                  dat.push(user.email);
                  dat.push(
                    <input
                      placeholder="Amount"
                      onChange={(e) => {
                        this.setState({ amount: e.target.value });
                      }}
                      type={"number"}
                    />
                  );
                  dat.push(
                    <input
                      placeholder="Account ID"
                      onChange={(e) => {
                        this.setState({ accountId: e.target.value });
                      }}
                      type={"text"}
                    />
                  );
                  dat.push(
                    <button
                      onClick={() => {
                        console.log("PRESSED");
                        this.createTrans({ userId: user.id });
                      }}
                    >
                      {" "}
                      Send Transaction{" "}
                    </button>
                  );
                  dat.push(
                    <button
                      onClick={async () => {
                        let ac = [];

                        if (this.state.currentHistory.length > 0) {
                          
                          for (let i = 0; i < this.state.currentHistory.length; ++i) {
                            let value = this.state.currentHistory.pop();
                            ac.push(value);
                          }
                        }
                        let states_data = await this.parseStatesData(user.accountId);

                        user.accounts.map((acc) => {
                          ac.push(
                            states_data
                          );
                        });
                        this.setState({ currentHistory: ac });
                      }}
                    >
                      Show{" "}
                    </button>
                  );

                  data.push(dat);
                });

                return data;
              })()}
            />
            */}

            </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withStyles(styles)(Dashboard);
