import React from "react";
import { Link } from "react-router-dom";
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
import BlobEdit from "components/BlobEdit/BlobEdit";
import cogoToast from "cogo-toast";
import Loader from "components/Loader/Loader";

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

class Bucket extends React.Component {
  state = {
    auth: true,
    anchorEl: null,
    blobs: [],
    error: "",
    status: "",
    blobLoading: true,
    token: "",
    userId: "",
    editLoading: false,
    blob: null,
    isEditing: false,
    bucketId: ""
  };

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const bucketId = this.props.match.params.id;
    const userId = localStorage.getItem("userId");

    this.setState({
      token,
      userId,
      bucketId
    });

    this.loadBlobs(userId, token, bucketId);
  }

  loadBlobs = (uuid, tok, bucket_id) => {
    fetch(
      `http://localhost:5000/api/users/${uuid}/buckets/${bucket_id}/blobs`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + tok,
          Accept: "application/json"
        }
      }
    )
      .then(res => {
        if (res.status !== 200) {
          throw new Error("Failed to load blobs");
        }
        return res.json();
      })
      .then(data => {
        this.setState({
          blobs: data.data.blobs,
          blobLoading: false
        });
      });
  };

  manageBlobHandler = (e, blobData) => {
    const formData = new FormData();
    formData.append("name", blobData.name);
    formData.append("image", blobData.image);

    this.setState({
      editLoading: true
    });

    let uuid = this.state.userId;
    let tok = this.state.token;
    let bucket_id = this.state.bucketId;

    let url = `http://localhost:5000/api/users/${uuid}/buckets/${bucket_id}/blobs`;
    let method = "POST";

    if (this.state.blob) {
      formData.append("name", blobData.name);
      formData.append("image", blobData.image);

      url = `http://localhost:5000/api/users/${uuid}/buckets/${bucket_id}/blobs/${
        this.state.blob.id
      }`;

      method = "PUT";
    }

    fetch(url, {
      method: method,
      headers: {
        Authorization: "Bearer " + tok
        // "Content-Type": "application/json"
      },
      body: formData
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Creating or editing a bucket failed!");
        }

        return res.json();
      })
      .then(data => {
        if (data.update === true) {
          cogoToast.success("Blob updated");
          this.loadBlobs(
            this.state.userId,
            this.state.token,
            this.state.bucketId
          );
        } else {
          cogoToast.success("Blob created");

          this.setState({
            blobLoading: false,
            editLoading: false,
            blob: null,
            isEditing: false
          });

          this.loadBlobs(
            this.state.userId,
            this.state.token,
            this.state.bucketId
          );
        }
      })
      .catch(err => {
        cogoToast.error(err.message);
        this.setState({
          isEditing: false,
          blob: null,
          editLoading: false,
          error: err
        });
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

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  redirectTo = () => {
    this.props.history.push(`/`);
  };

  editBlobHandler = blobId => {
    this.setState(prevState => {
      const blob = {
        ...prevState.blobs.find(blob => blob.id === blobId)
      };

      return {
        blob,
        isEditing: true
      };
    });
  };

  deleteBlobHandler = blobId => {
    this.setState({ blobLoading: true });

    fetch(
      `http://localhost:5000/api/users/${this.state.userId}/buckets/${
        this.state.bucketId
      }/blobs/${blobId}`,
      {
        headers: {
          Authorization: "Bearer " + this.state.token,
          "Content-Type": "application/json"
        },
        method: "DELETE"
      }
    )
      .then(res => {
        if (res.status !== 200 && res.status !== 204) {
          throw new Error("Can not delete");
        }

        return res.json();
      })
      .then(data => {
        if (data.delete === true) {
          cogoToast.success("Blob deleted");

          this.loadBlobs(
            this.state.userId,
            this.state.token,
            this.state.bucketId
          );

          this.setState(prevState => {
            const newBlobs = prevState.blobs.filter(blob => blob.id !== blobId);

            return {
              blobs: newBlobs,
              blobLoading: false
            };
          });
        }
      })
      .catch(err => {
        this.setState({ blobLoading: false });
      });
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
                Blobs List
              </Typography>

              <div className={classes.heroButtons}>
                <Grid container spacing={16} justify="center">
                  <Grid item>
                    <Button
                      onClick={this.redirectTo}
                      variant="outlined"
                      color="secondary"
                      className={classes.button}
                    >
                      Back
                    </Button>
                  </Grid>
                  <Grid item>
                    <BlobEdit
                      onEditBlob={this.manageBlobHandler}
                      selectedBlob={this.state.blob}
                      editing={this.state.isEditing}
                    />
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
          <div className={classNames(classes.layout, classes.cardGrid)}>
            {this.state.blobLoading && (
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <Loader />
              </div>
            )}
            {this.state.blobs.length <= 0 && !this.state.blobLoading ? (
              <p style={{ textAlign: "center" }}>No Blob Found</p>
            ) : null}
            {/* End hero unit */}
            <Grid container spacing={40}>
              {this.state.blobs.map(card => (
                <Grid item key={card.id} sm={6} md={4} lg={3}>
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
                        onClick={() => this.editBlobHandler(card.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.deleteBlobHandler(card.id)}
                      >
                        Delete
                      </Button>
                      <Link
                        to={`/single-blob/${this.state.bucketId}/${card.id}`}
                      >
                        Show
                      </Link>
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
