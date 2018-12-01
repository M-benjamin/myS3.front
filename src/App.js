import React, { Component } from "react";
import {
  Route,
  Router,
  Switch,
  Redirect,
  withRouter,
  Link
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./layout/Dashboard/Dashboard";

import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div>
        <Link to="/">Login</Link>
        <Link to="/dashboard">Dashbord</Link>
        <Link to="/register">Register</Link>

        <Route exact path="/" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/register" component={Register} />
      </div>
    );
  }
}

export default App;
