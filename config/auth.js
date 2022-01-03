module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("err_msg", "Please login or contact us to view this resource");
    res.redirect("/users/auth/login");
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      req.flash("err_msg", "Unauthorized, please try again");
      return next();
    }
    res.redirect("/dashboard");
  },
};
