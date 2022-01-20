import React, { Component } from "react";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";

class SnackbarCustom extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { isVisible, color, message } = this.props;

    return isVisible ? (
      <Snackbar open={isVisible}>
        <Alert severity={color}>{message}</Alert>
      </Snackbar>
    ) : (
      <React.Fragment></React.Fragment>
    );
  }
}

export default SnackbarCustom;
