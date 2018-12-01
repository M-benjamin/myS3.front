import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import indexRoutes from "routes/index.js";

import { Router, Route, Switch } from "react-router-dom";
import Dashboard from "layout/Dashboard/Dashboard";
import Login from "pages/Auth/Login";
import Register from "pages/Auth/Register";

import { createBrowserHistory } from "history";
const hist = createBrowserHistory();

const app = (
  <Router history={hist}>
    <App />
  </Router>
);

ReactDOM.render(app, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
