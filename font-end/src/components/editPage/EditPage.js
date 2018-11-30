import React, { Component } from "react";

class EditPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      email: ""
    };
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  setmail = e => {
    e.preventDefault();
    this.props.saveEmail(this.state.email);
  };

  componentDidMount() {
    this.setState({ email: this.props.profileData.email });
  }

  render() {
    return (
      <form onSubmit={this.setmail}>
        <div className="main-profile-wrapper">
          <div className="profile-page-wrapper">
            <div className="profile-item">
              <label>Email:</label>
              <input
                className="input"
                type="email"
                name="email"
                value={this.state.email}
                onChange={this.handleChange}
              />
            </div>
            <div className="profile-item">
              <button type="submit"> Save </button>
              <button onClick={this.props.editMail}> Back </button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

export default EditPage;
