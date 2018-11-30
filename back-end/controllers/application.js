const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const userDb = require("./../model/user");

const register = function(req, res) {
  req.checkBody("name", "Enter a name").exists();
  req
    .checkBody("email", "Invalid Email")
    .exists()
    .isEmail();
  req
    .checkBody("password", "Password should be of atleast 8 characters.")
    .exists()
    .isLength({
      min: 8
    });
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  userDb.findByMail(req.body.email.toString().trim()).exec((err, data) => {
    if (err) throw err;
    else if (data) res.failure("There is already someone with this email.");
    else {
      let user = new userDb();
      user.email = req.body.email.toString().trim();
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(req.body.password.toString(), salt);
      user.password = hash;
      user.name = req.body.name.toString();
      let token = jwt.sign(
        {
          email: user.email,
          password: user.password
        },
        "userSecret"
      );
      user.token = token;
      userDb(user).save();
      res.status(200).success(user);
    }
  });
};

const login = function(req, res) {
  req
    .checkBody("email", "Invalid Email")
    .exists()
    .isEmail();
  req
    .checkBody("password", "Password should be of atleast 8 characters.")
    .exists()
    .isLength({
      min: 8
    });
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  userDb.findByMail(req.body.email.toString().trim()).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.failure("There is no account with this email.");
    else {
      if (
        data.password &&
        bcrypt.compareSync(req.body.password.toString().trim(), data.password)
      ) {
        let token = jwt.sign(
          {
            email: data.email,
            password: data.password
          },
          "userSecret"
        );
        userDb.updateToken(data["_id"], token);
        delete data["password"];
        data["password"] = true;
        return res.status(200).success(
          {
            token: token,
            info: data
          },
          "User Logged In successfully"
        );
      } else res.failure("Password is incorrect.");
    }
  });
};

const confirmProfile = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.failure("No user was found");
    else {
      if (data["password"]) {
        delete data["password"];
        data["password"] = true;
      } else data["password"] = false;
      res.status(200).success(data, "User found");
    }
  });
};

const logout = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.failure("No user was found");
    else {
      userDb.removeToken(data._id);
      res.success(data, "User logged out successfully.");
    }
  });
};

const oAuthSignUp = function(req, res) {
  req.checkBody("provider", "Enter oAuth type.").exists();
  req.checkBody("id", "oAuth Id is required.").exists();
  req.checkBody("name", "Name is mandatory.").exists();
  req.checkBody("email", "email is mandatory.").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  userDb
    .findOne({
      $or: [
        {
          email: req.body.email.toString().trim()
        },
        {
          provider: req.body.provider,
          provider_id: req.body.id
        }
      ],
      isDeleted: false
    })
    .exec((err, data) => {
      if (err) throw err;
      else if (!data) {
        let newProvider;
        if (req.body.provider === "google") newProvider = "facebook";
        else newProvider = "google";
        userDb
          .findOne({
            email: req.body.email.toString().trim(),
            provider: newProvider
          })
          .exec((err, oauthuser) => {
            if (err) throw err;
            else if (oauthuser)
              res.failure(
                `This email is already registered using ${newProvider}`
              );
            else {
              let user = new userDb();
              if (req.body.email) user.email = req.body.email.toString().trim();
              user.name = req.body.name.toString();
              user.provider = req.body.provider.toString();
              user.provider_id = req.body.id;
              let token = jwt.sign(
                {
                  email: user.email
                },
                "userSecret"
              );
              user.token = token;
              userDb(user).save();
              user["password"] = false;
              res.status(200).success({ token: user.token, info: user });
            }
          });
      } else {
        res.failure("Account with this email or platform already exists.");
      }
    });
};

const oAuthLogin = function(req, res) {
  req.checkBody("provider", "Enter oAuth type.").exists();
  req.checkBody("id", "oAuth Id is required.").exists();
  req.checkBody("name", "Name is mandatory.").exists();
  req.checkBody("email", "email is mandatory.").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  userDb
    .findOne({
      provider: req.body.provider,
      provider_id: req.body.id,
      isDeleted: false
    })
    .exec((err, data) => {
      if (err) throw err;
      else if (!data) {
        res.failure("Account does not exists.");
      } else {
        let token = jwt.sign(
          {
            email: data.email,
            provider_id: data.provider_id
          },
          "userSecret"
        );
        userDb.updateToken(data["_id"], token);
        if (data["password"]) {
          delete data["password"];
          data["password"] = true;
        } else data["password"] = false;
        return res.status(200).success(
          {
            token: token,
            info: data
          },
          "User Logged In successfully"
        );
      }
    });
};

const addPassword = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();
  req
    .checkBody("password", "Password should be of atleast 8 characters.")
    .exists()
    .isLength({
      min: 8
    });
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.failure("No user was found");
    else {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(req.body.password.toString(), salt);
      userDb.addPassword(data._id, hash);
      data["password"] = true;
      res.status(200).success(data, "Password was set.");
    }
  });
};

const unlink = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.failure("Invalid Token.");
    else {
      userDb
        .updateOne(
          { _id: data._id },
          { $set: { provider: null, provider_id: null } }
        )
        .exec((err, unlinkedStatus) => {
          if (err) throw err;
          else {
            data.password = true;
            data.provider = null;
            data.provider_id = null;

            res.status(200).success(data, "Account was unlinked.");
          }
        });
    }
  });
};

const link = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();
  req.checkBody("id", "No id was found").exists();
  req.checkBody("provider", "No provider was found").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.failure("Invalid Token.");
    else {
      userDb
        .findOne({
          provider: req.body.provider.toString().trim(),
          provider_id: req.body.id
        })
        .exec((err, account) => {
          if (err) throw err;
          else if (account)
            res.failure(
              "There is account linked to this social medio account."
            );
          else {
            userDb
              .updateOne(
                { _id: data._id },
                {
                  $set: {
                    provider: req.body.provider.toString().trim(),
                    provider_id: req.body.id
                  }
                }
              )
              .exec((err, unlinkedStatus) => {
                if (err) throw err;
                else {
                  data.password = true;
                  data.provider = req.body.provider.toString().trim();
                  data.provider_id = req.body.id;
                  res.status(200).success(data, "Account was linked.");
                }
              });
          }
        });
    }
  });
};

const editEmail = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();
  req.checkBody("email", "No email was found").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.failure("Invalid Token.");
    else {
      userDb
        .findOne({ email: req.body.email.toString().trim() })
        .exec((err, email) => {
          if (err) throw err;
          else if (email) res.failure("Account with this email already exists.");
          else {
            userDb
              .updateOne(
                { _id: data._id },
                {
                  $set: {
                    email: req.body.email.toString().trim()
                  }
                }
              )
              .exec((err, unlinkedStatus) => {
                if (err) throw err;
                else {
                  if (data.password) data.password = true;
                  else data.password = false;
                  data.email = req.body.email.toString().trim();
                  res.status(200).success(data, "Account was linked.");
                }
              });
          }
        });
    }
  });
};

const deleteAccount = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.failure("No user was found");
    else {
      userDb.deleteAccount(data._id);
      res.success(data, "Account deleted successfully.");
    }
  });
};

module.exports = {
  login,
  register,
  confirmProfile,
  logout,
  oAuthSignUp,
  oAuthLogin,
  addPassword,
  unlink,
  link,
  editEmail,
  deleteAccount
};
