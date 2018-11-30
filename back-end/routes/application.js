var express = require("express");
var router = express.Router();
const applicationControllers = require("../controllers/application.js");

router.post("/login", applicationControllers.login);
router.post("/register", applicationControllers.register);
router.get("/confirm-profile", applicationControllers.confirmProfile);
router.delete("/logout", applicationControllers.logout);
router.post("/o-auth-signup", applicationControllers.oAuthSignUp);
router.post("/o-auth-login", applicationControllers.oAuthLogin);
router.post("/add-password", applicationControllers.addPassword);
router.post("/unlink", applicationControllers.unlink);
router.post("/link", applicationControllers.link);
router.post("/edit-email", applicationControllers.editEmail);
router.delete("/delete-account", applicationControllers.deleteAccount);

module.exports = router;
