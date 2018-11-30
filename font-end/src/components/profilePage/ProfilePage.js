import React, { Component } from "react";
import FacebookLogin from "react-facebook-login";
import { GoogleLogin } from "react-google-login";
import "../../../node_modules/font-awesome/css/font-awesome.min.css";
import "bulma/css/bulma.css";
import Notification from "react-bulma-notification";
import "react-bulma-notification/build/css/index.css";
import "./profile.css";
import EditPage from "./../editPage/EditPage";

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      editMail: false
    };
  }

  unlinkAccount = () => {
    if (
      !this.props.profileData.password ||
      this.props.profileData.password === "false"
    )
      Notification.error("Set a password before unlinking the account");
    else {
      this.props.unlink();
    }
  };

  linkAccount = (response, platform) => {
    let data = {};
    if (platform === "facebook") {
      data.id = response.id;
      data.provider = "facebook";
    } else {
      data.id = response.profileObj.googleId;
      data.provider = "google";
    }
    this.props.link(data);
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    if (!this.state.editMail) {
      return (
        <div className="main-profile-wrapper">
          <div className="profile-page-wrapper">
            {this.props.profileData._id && this.props.profileData._id !== "" ? (
              <div className="profile-item">
                <label>Unique user Id:</label>{" "}
                <span>{this.props.profileData._id}</span>
              </div>
            ) : (
              ""
            )}
            {this.props.profileData.name &&
            this.props.profileData.name !== "" ? (
              <div className="profile-item">
                <label>Name:</label> <span>{this.props.profileData.name}</span>
              </div>
            ) : (
              ""
            )}
            {this.props.profileData.email &&
            this.props.profileData.email !== "" ? (
              <div className="profile-item">
                <label>Email:</label>{" "}
                <span>{this.props.profileData.email}</span>
              </div>
            ) : (
              ""
            )}
            {this.props.profileData.provider &&
            this.props.profileData.provider !== "" ? (
              <div className="profile-item">
                <label>Linked To:</label>{" "}
                <span>{this.props.profileData.provider}</span>
                <button onClick={this.unlinkAccount}>
                  unlink from {this.props.profileData.provider}
                </button>
              </div>
            ) : (
              <div>
                <FacebookLogin
                  appId="986889214853397"
                  autoLoad={false}
                  fields="name,email,picture"
                  callback={response => this.linkAccount(response, "facebook")}
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
                  onSuccess={response => this.linkAccount(response, "google")}
                  onFailure={this.responseGoogle}
                />
              </div>
            )}
            {!this.props.profileData.password ||
            this.props.profileData.password === "false" ? (
              <div className="profile-item">
                <label>Set Password:</label>{" "}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    this.props.addPassword(this.state.password);
                  }}
                >
                  <input
                    type="password"
                    name="password"
                    onChange={this.handleChange}
                    required
                  />
                  <button type="submit">Submit</button>
                </form>
              </div>
            ) : (
              ""
            )}
            <div className="profile-item">
              <button onClick={this.props.logout}>Logout</button>
              <button onClick={this.props.deleteAccount}>Delete Account</button>
              <button
                onClick={() => {
                  this.setState({ editMail: true });
                }}
              >
                Change Email
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <EditPage
          editMail={() => this.setState({ editMail: false })}
          saveEmail={email => {
            this.props.saveEmail(email);
            this.setState({ editMail: false });
          }}
          profileData={this.props.profileData}
        />
      );
    }
  }
}

export default ProfilePage;
