const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    req.flash("err_msg", "A token is required to verify your email");
    return res.redirect("/");
  }
  try {
    const decoded = jwt.verify(token, "secrete");
    if (decoded) {
      req.flash("success_msg", "Email verified");
      console.log(decoded);
      return res.redirect("/");
    }
  } catch (err) {
    req.flash("err_msg", "Invalid token");
    return res.redirect("/");
  }
  return next();
};

module.exports = verifyToken;
