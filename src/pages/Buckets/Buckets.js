import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import CameraIcon from "@material-ui/icons/PhotoCamera";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Loader from "components/Loader/Loader";
import BucketEdit from "components/BucketEdit/BucketEdit";
import cogoToast from "cogo-toast";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  appBar: {
    position: "relative"
  },
  icon: {
    marginRight: theme.spacing.unit * 2
  },
  heroUnit: {
    backgroundColor: theme.palette.background.paper
  },
  heroContent: {
    maxWidth: 600,
    margin: "0 auto",
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`
  },
  heroButtons: {
    marginTop: theme.spacing.unit * 4
  },
  layout: {
    width: "auto",
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
      width: 1100,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 8}px 0`
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  cardMedia: {
    paddingTop: "56.25%" // 16:9
  },
  cardContent: {
    flexGrow: 1
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing.unit * 6
  }
});

const cards = [1, 2, 3, 4];

class Bucket extends React.Component {
  state = {
    auth: true,
    anchorEl: null,
    buckets: [],
    error: "",
    status: "",
    bucketLoading: true,
    token: "",
    userId: "",
    editLoading: false,
    bucket: null,
    isEditing: false
  };

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    console.log("token", token);
    const userId = localStorage.getItem("userId");
    console.log(userId);
    this.setState({
      token,
      userId
    });

    this.loadBuckets(userId, token);
  }

  loadBuckets = (uuid, tok) => {
    console.log(tok);
    fetch(`http://localhost:5000/api/users/${uuid}/buckets`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + tok,
        Accept: "application/json"
      }
    })
      .then(res => {
        console.log("RES", res);
        if (res.status !== 200) {
          throw new Error("Failed to load buckets");
        }
        return res.json();
      })
      .then(data => {
        console.log("BUCKET", data);
        this.setState({
          buckets: data.data.buckets,
          bucketLoading: false
        });
      });
  };

  editBucketsHandler = bucketId => {
    console.log("id", bucketId);
    this.setState(prevState => {
      const bucket = {
        ...prevState.buckets.find(buck => buck.id === bucketId)
      };

      console.log("ME", bucket);

      return {
        bucket,
        isEditing: true
      };
    });
  };

  manageBucketHandler = (e, bucketData) => {
    console.log("BUUUUUU", bucketData);
    const formData = new FormData();

    formData.append("name", bucketData.name);

    this.setState({
      editLoading: true
    });

    let uuid = this.state.userId;
    let tok = this.state.token;

    let url = `http://localhost:5000/api/users/${uuid}/buckets`;
    let method = "POST";

    if (this.state.bucket) {
      console.log("BUCKET", this.state.bucket);
      url = `http://localhost:5000/api/users/${uuid}/buckets/${
        this.state.bucket.id
      }`;

      method = "PUT";
    }

    console.log("METHOS", method);
    console.log("METHOS 2", formData);
    console.log("METHOS 2", bucketData.name);

    fetch(url, {
      method: method,
      headers: {
        Authorization: "Bearer " + tok,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: bucketData.name
      })
    })
      .then(res => {
        console.log(res);
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Creating or editing a bucket failed!");
        }

        return res.json();
      })
      .then(data => {
        if (data.update === true) {
          cogoToast.success("Bucket updated");
          this.loadBuckets(this.state.userId, this.state.token);
        } else {
          console.log("EDIT", data);
          cogoToast.success("Bucket created");

          this.setState({
            bucketLoading: false,
            editLoading: false,
            bucket: null,
            isEditing: false
          });

          console.log("THIS", this);
          this.loadBuckets(this.state.userId, this.state.token);
        }
      })
      .catch(err => {
        this.setState({
          isEditing: false,
          bucket: null,
          editLoading: false,
          error: err
        });
      });
  };

  deleteBucketsHandler = bucketId => {
    this.setState({ bucketLoading: true });
    console.log("IDE", bucketId);
    fetch(
      `http://localhost:5000/api/users/${
        this.state.userId
      }/buckets/${bucketId}`,
      {
        headers: {
          Authorization: "Bearer " + this.state.token,
          "Content-Type": "application/json"
        },
        method: "DELETE"
      }
    )
      .then(res => {
        console.log("DELETE");
        if (res.status !== 200 && res.status !== 204) {
          throw new Error("Can not delete");
        }

        return res.json();
      })
      .then(data => {
        console.log(data);
        if (data.delete === true) {
          cogoToast.success("Bucket deleted");
          // this.loadBuckets(this.state.userId, this.state.token);

          this.setState(prevState => {
            const newBuckets = prevState.buckets.filter(
              buck => buck.id !== bucketId
            );

            console.log("Delete", newBuckets);

            return {
              buckets: newBuckets,
              bucketLoading: false
            };
          });
        }
      })
      .catch(err => {
        this.setState({ bucketLoading: false });
      });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  handleChange = event => {
    this.setState({ auth: event.target.checked });
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  onLogout = () => {
    this.setState({ anchorEl: null });
    this.props.logout();
  };

  render() {
    const { classes } = this.props;
    const { auth, anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <React.Fragment>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              Manage bucket
            </Typography>
            {auth && (
              <div>
                <IconButton
                  aria-owns={open ? "menu-appbar" : undefined}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right"
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right"
                  }}
                  open={open}
                  onClose={this.handleClose}
                >
                  <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                  <MenuItem onClick={this.onLogout}>Logout</MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
        <main>
          {/* Hero unit */}
          <div className={classes.heroUnit}>
            <div className={classes.heroContent}>
              <Typography
                component="h1"
                variant="h2"
                align="center"
                color="textPrimary"
                gutterBottom
              >
                Bucket List
              </Typography>

              <div className={classes.heroButtons}>
                <Grid container spacing={16} justify="center">
                  <Grid item>
                    <BucketEdit
                      onEditBucket={this.manageBucketHandler}
                      selectedBucket={this.state.bucket}
                      editing={this.state.isEditing}
                    />
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
          <div className={classNames(classes.layout, classes.cardGrid)}>
            {this.state.bucketLoading && (
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <Loader />
              </div>
            )}
            {this.state.buckets.length <= 0 && !this.state.bucketLoading ? (
              <p style={{ textAlign: "center" }}>No Bucket Found</p>
            ) : null}
            {/* End hero unit */}
            <Grid container spacing={40}>
              {this.state.buckets.map(card => (
                <Grid item key={card.id} sm={6} md={4} lg={4}>
                  <Card className={classes.card}>
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {card.name}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.editBucketsHandler(card.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.deleteBucketsHandler(card.id)}
                      >
                        Delete
                      </Button>
                      <Button size="small" color="primary">
                        Add blob
                      </Button>
                      <Button size="small" color="primary">
                        List blob
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </main>
        {/* Footer */}
        <footer className={classes.footer}>
          <Typography variant="h6" align="center" gutterBottom>
            Footer
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="textSecondary"
            component="p"
          >
            Something here to give the footer a purpose!
          </Typography>
        </footer>
        {/* End footer */}
      </React.Fragment>
    );
  }
}

Bucket.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Bucket);
