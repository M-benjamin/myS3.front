import React, { Component } from "react";
import cogoToast from "cogo-toast";

import {
  Route,
  Router,
  Switch,
  Redirect,
  withRouter,
  Link
} from "react-router-dom";
import Login from "pages/Auth/Login";
import Register from "pages/Auth/Register";
import Bucket from "pages/Buckets/Buckets";
import Blob from "pages/Blobs/Blobs";
import SingleBlob from "pages/Blobs/SingleBlob.js";

import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  state = {
    isAuth: false,
    token: null,
    userId: null,
    authLoading: false,
    error: null
  };

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    console.log("token", token);
    console.log("token", this.state);

    const userId = localStorage.getItem("userId");
    console.log("userId", userId);
    this.setState({
      isAuth: true,
      token: token,
      userId: userId
    });
  }

  registerHandle = (event, authData) => {
    console.log("DATA", authData);
    event.preventDefault();
    this.setState({ authLoading: true });
    fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(authData)
    })
      .then(res => {
        if (res.status === 422) {
          throw new Error("Make sure email is not use yet");
        }

        if (res.status !== 200 && res.status !== 201) {
          console.log("ERROO");
          throw new Error("Creation user failed");
        }
        return res.json();
      })
      .then(data => {
        console.log("REGISTER", data);
        this.setState({
          isAuth: false,
          authLoading: false
        });

        cogoToast.success("User successfull created");

        this.props.history.push("/");
      })
      .catch(err => {
        console.log(err);
        cogoToast.error(err.message);
        this.setState({
          isAuth: false,
          authLoading: false,
          error: err
        });
      });
  };

  logoutHandler = () => {
    console.log("LOGOUT");
    this.setState({ isAuth: false, token: null });
    localStorage.removeItem("token");
    // localStorage.removeItem("expiryDate");
    localStorage.removeItem("userId");
    cogoToast.success("You are logout");
    // this.props.history.push("/");
  };

  loginHandler = (event, authData) => {
    event.preventDefault();
    this.setState({ authLoading: true });

    fetch("http://localhost:5000/api/auth/login", {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(authData)
    })
      .then(res => {
        if (res.status === 422) {
          throw new Error("Validation failed");
        }

        if (res.status !== 200 && res.status !== 201) {
          console.log("ERROO");
          throw new Error("Could not Login");
        }
        return res.json();
      })
      .then(data => {
        console.log("LOGIN", data);
        this.setState({
          isAuth: true,
          token: data.meta.token,
          authLoading: false,
          userId: data.data.user.uuid
        });

        localStorage.setItem("token", data.meta.token);
        localStorage.setItem("userId", data.data.user.uuid);
        cogoToast.success("User successfull Login");
      })
      .catch(err => {
        console.log(err);
        cogoToast.error(err.message);

        this.setState({
          isAuth: false,
          authLoading: false,
          error: err
        });
      });
  };

  render() {
    let routes = (
      <Switch>
        <Route
          path="/"
          exact
          render={props => <Login {...props} onLogin={this.loginHandler} />}
        />
        <Route
          path="/register"
          exact
          render={props => (
            <Register {...props} onSignup={this.registerHandle} />
          )}
        />
      </Switch>
    );

    if (this.state.isAuth) {
      routes = (
        <Switch>
          <Route
            path="/"
            exact
            render={props => <Bucket {...props} logout={this.logoutHandler} />}
          />
          <Route
            path="/blob/:id"
            exact
            render={props => <Blob {...props} logout={this.logoutHandler} />}
          />
          <Route
            path="/single-blob/:bucket_id/:id"
            exact
            render={props => (
              <SingleBlob {...props} logout={this.logoutHandler} />
            )}
          />
        </Switch>
      );
    }

    return <div>{routes}</div>;
  }
}

export default App;
