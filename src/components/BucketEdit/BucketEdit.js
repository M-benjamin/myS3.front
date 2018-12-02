import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import PropTypes from "prop-types";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import LockIcon from "@material-ui/icons/LockOutlined";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import { Link } from "react-router-dom";
import cogoToast from "cogo-toast";

const styles = theme => ({
  background: {},
  main: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
      .spacing.unit * 3}px`
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
    padding: "10px"
  },
  submit: {
    marginTop: theme.spacing.unit * 3
  }
});

class BucketEdit extends Component {
  state = {
    open: false,
    name: ""
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.editing &&
      prevProps.editing !== this.props.editing &&
      prevProps.selectedBucket !== this.props.selectedBucket
    ) {
      this.setState({
        ...prevState.name,
        name: this.props.selectedBucket.name,
        open: true
      });
    }
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleChange = event => {
    let { name, value } = event.target;

    this.setState({ [name]: value });
  };

  saveBucketHandler = e => {
    this.setState({ open: false });
    this.props.onEditBucket(e, this.state);
  };

  render() {
    const { classes } = this.props;
    const { name } = this.state;

    return (
      <div>
        <Button
          onClick={this.handleClickOpen}
          variant="contained"
          color="primary"
        >
          Create bucket
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Bucket</DialogTitle>
          <form
            className={classes.form}
            // onSubmit={e => this.props.onEditBucket(e, this.state)}
          >
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="nickname">name</InputLabel>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={this.handleChange}
                autoComplete="name"
                autoFocus
              />
            </FormControl>

            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={this.saveBucketHandler} color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    );
  }
}

BucketEdit.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BucketEdit);
