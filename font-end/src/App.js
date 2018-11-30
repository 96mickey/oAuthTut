import React, { Component } from "react";
import ProfilePage from "./components/profilePage/ProfilePage";
import FacebookLogin from "react-facebook-login";
import { GoogleLogin } from "react-google-login";
import { PostData, GetData, DeleteData } from "./helpers/apicall";
import "../node_modules/font-awesome/css/font-awesome.min.css";
import "bulma/css/bulma.css";
import Notification from "react-bulma-notification";
import "react-bulma-notification/build/css/index.css";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      authForm: "login",
      name: "",
      email: "",
      password: ""
    };
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  login = e => {
    e.preventDefault();
    PostData("login", this.state)
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.setItem("token", result.data.token);
          this.setState({ authenticated: true, data: result.data.info });
          Notification.success("Welcome");
        }
      })
      .catch(error => Notification.error("Error! Please try again."));
  };

  signup = e => {
    e.preventDefault();
    PostData("register", this.state)
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.setItem("token", result.data.token);
          this.setState({ authenticated: true, data: result.data });
          Notification.success("Welcome");
        }
      })
      .catch(error => Notification.error("Error! Please try again."));
  };

  logout = e => {
    e.preventDefault();
    DeleteData("logout")
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.clear();
          this.setState({
            authenticated: false,
            authForm: "login",
            name: "",
            email: "",
            password: "",
            data: {}
          });
          Notification.success("You have successfully logged out.");
        }
      })
      .catch(error => Notification.error("Error! Please try again."));
  };

  link = data => {
    PostData("link", data)
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.setItem("token", result.data.token);
          this.setState({ authenticated: true, data: result.data });
        }
      })
      .catch(error => {
        Notification.error("Error! Please try again.");
      });
  };

  unlink = () => {
    PostData("unlink")
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.setItem("token", result.data.token);
          this.setState({ authenticated: true, data: result.data });
        }
      })
      .catch(error => {
        Notification.error("Error! Please try again.");
      });
  };

  deleteAcc = () => {
    DeleteData("delete-account")
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.clear();
          this.setState({
            authenticated: false,
            authForm: "login",
            name: "",
            email: "",
            password: "",
            data: {}
          });
          Notification.success("Account deleted successfully.");
        }
      })
      .catch(error => Notification.error("Error! Please try again."));
  };

  saveEmail = email => {
    PostData("edit-email", { email })
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          this.setState({ authenticated: true, data: result.data });
        }
      })
      .catch(error => {
        Notification.error("Error! Please try again.");
      });
  };

  addPassword = password => {
    PostData("add-password", { password })
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.setItem("token", result.data.token);
          this.setState({ authenticated: true, data: result.data });
        }
      })
      .catch(error => Notification.error("Error! Please try again."));
  };

  signupForm = () => {
    this.setState({ authForm: "signup", name: "", email: "", password: "" });
  };

  loginForm = () => {
    this.setState({ authForm: "login", name: "", email: "", password: "" });
  };

  responseFacebook = response => {
    let data = {};
    data.id = response.id;
    data.name = response.name;
    data.email = response.email;
    data.provider = "facebook";
    PostData("o-auth-signup", data)
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.setItem("token", result.data.token);
          this.setState({ authenticated: true, data: result.data.info });
          Notification.success("Welcome");
        }
      })
      .catch(error => Notification.error("Error! Please try again."));
  };

  responseGoogle = response => {
    let data = {};
    data.id = response.profileObj.googleId;
    data.name = response.profileObj.name;
    data.email = response.profileObj.email;
    data.provider = "google";
    PostData("o-auth-signup", data)
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.setItem("token", result.data.token);
          this.setState({ authenticated: true, data: result.data.info });
          Notification.success("Welcome");
        }
      })
      .catch(error => Notification.error("Error! Please try again."));
  };

  responseGoogleLogin = response => {
    let data = {};
    data.id = response.profileObj.googleId;
    data.name = response.profileObj.name;
    data.email = response.profileObj.email;
    data.provider = "google";
    PostData("o-auth-login", data)
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.setItem("token", result.data.token);
          this.setState({ authenticated: true, data: result.data.info });
          Notification.success("Welcome");
        }
      })
      .catch(error => Notification.error("Error! Please try again."));
  };

  responseFacebookLogin = response => {
    let data = {};
    data.id = response.id;
    data.name = response.name;
    data.email = response.email;
    data.provider = "facebook";
    PostData("o-auth-login", data)
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          localStorage.setItem("token", result.data.token);
          this.setState({ authenticated: true, data: result.data.info });
          Notification.success("Welcome");
        }
      })
      .catch(error => Notification.error("Error! Please try again."));
  };

  componentDidMount = () => {
    if (localStorage.token && localStorage.token !== "") {
      GetData("confirm-profile")
        .then(result => {
          if (result.status === "failure") {
            localStorage.clear();
          } else {
            localStorage.setItem("token", result.data.token);
            this.setState({ authenticated: true, data: result.data });
            Notification.success("Welcome");
          }
        })
        .catch();
    }
  };

  render() {
    let { authenticated, data } = this.state;
    if (!authenticated) {
      return (
        <div className="App">
          {this.state.authForm === "login" ? (
            <div>
            <div>Login Form</div>
              <FacebookLogin
                appId="986889214853397"
                autoLoad={false}
                fields="name,email,picture"
                callback={this.responseFacebookLogin}
                cssClass="btnFacebook"
                icon={
                  <i
                    className="fa fa-facebook"
                    style={{ marginRight: "5px" }}
                  />
                }
              />
              <GoogleLogin
                clientId="522249123340-1jcr29tkqpfhk5phfnb45cud5q4c7fa7.apps.googleusercontent.com"
                buttonText="Login"
                className="btnGoogle"
                onSuccess={this.responseGoogleLogin}
                onFailure={this.responseGoogleLogin}
              />
            </div>
          ) : (
            <div>
            <div>Sign Up Form</div>
              <FacebookLogin
                textButton="Sign up with fb"
                appId="986889214853397"
                autoLoad={false}
                fields="name,email,picture"
                callback={this.responseFacebook}
                cssClass="btnFacebook"
                icon={
                  <i
                    className="fa fa-facebook"
                    style={{ marginRight: "5px" }}
                  />
                }
              />
              <GoogleLogin
                clientId="522249123340-1jcr29tkqpfhk5phfnb45cud5q4c7fa7.apps.googleusercontent.com"
                buttonText="Sign Up"
                className="btnGoogle"
                onSuccess={this.responseGoogle}
                onFailure={this.responseGoogle}
              />
            </div>
          )}
          <div className="divider">
            <hr className="style-eight" />
          </div>
          <div className="auth-form-wrapper">
            <div className="auth-form">
              {this.state.authForm === "login" ? (
                <form onSubmit={this.login}>
                  <div className="form-input-field">
                    <label>Email:</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="Email"
                      name="email"
                      autoComplete="off"
                      onChange={this.handleChange}
                      value={this.state.email}
                      required
                    />
                  </div>
                  <div className="form-input-field">
                    <label>Password:</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="Password"
                      name="password"
                      onChange={this.handleChange}
                      value={this.state.password}
                      required
                    />
                  </div>
                  <div className="form-input-field">
                    <div className="submit-button-wrapper">
                      <button type="submit" className="submit-button">
                        Sign In
                      </button>
                    </div>
                  </div>
                  <div className="signupButton">
                    <span className="span-text" onClick={this.signupForm}>
                      New user ? (Sign up){" "}
                    </span>{" "}
                  </div>
                </form>
              ) : (
                <form onSubmit={this.signup}>
                  <div className="form-input-field">
                    <label>Name:</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="Name"
                      name="name"
                      autoComplete="off"
                      onChange={this.handleChange}
                      value={this.state.name}
                      required
                    />
                  </div>
                  <div className="form-input-field">
                    <label>Email:</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="Email"
                      name="email"
                      autoComplete="off"
                      onChange={this.handleChange}
                      value={this.state.email}
                      required
                    />
                  </div>
                  <div className="form-input-field">
                    <label>Password:</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="Password"
                      name="password"
                      onChange={this.handleChange}
                      value={this.state.password}
                      required
                    />
                  </div>
                  <div className="form-input-field">
                    <div className="submit-button-wrapper">
                      <button type="submit" className="submit-button">
                        Sign Up
                      </button>
                    </div>
                  </div>
                  <div className="signupButton">
                    <span className="span-text" onClick={this.loginForm}>
                      Log in{" "}
                    </span>{" "}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      );
    } else
      return (
        <ProfilePage
          link={this.link}
          unlink={this.unlink}
          addPassword={this.addPassword}
          logout={this.logout}
          deleteAccount={this.deleteAcc}
          saveEmail={email => this.saveEmail(email)}
          profileData={data}
        />
      );
  }
}

export default App;
