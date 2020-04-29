/* This module handles access control for the server */

//Export the middleware functions for use by the server
module.exports = {

  //Deny access to route if not logged in
  isLoggedIn: isLoggedIn = (req, res, next) => {
    //Check if user logged in
    //If logged out, send error message and redirect user to allowed 'Login' page
    req.session.username ? next() : res.status(403).redirect("/login");
  },

  //Deny access to route if not admin
  isAdmin: isAdmin = (req,res,next) => {
    //Check if user is admin
    //If not admin, send error message and redirect user to allowed 'Join Room' page
    req.session.priv >= 2 ? next() : res.status(403).redirect("/");
  },

  //Deny access to route if not high level admin
  isMaster: isMaster = (req,res,next) => {
    //Check if user high level admin
    //If not high level admin, send error message and redirect user to allowed 'Join Room' page
    req.session.priv == 3 ? next() : res.status(403).redirect("/");
  }

} //End module.exports
