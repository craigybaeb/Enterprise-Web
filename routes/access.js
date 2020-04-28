module.exports = {
  isLoggedIn: isLoggedIn = (req, res, next) => {
    req.session.username ? next() : res.status(403).redirect("/login");
  },
  isMaster: isMaster = (req,res,next) => {
    req.session.priv == 3 ? next() : res.status(403).redirect("/");
  },
  isAdmin: isAdmin = (req,res,next) => {
    req.session.priv >= 2 ? next() : res.status(403).redirect("/");
  }
}
