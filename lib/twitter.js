var OAuth       = require('oauth').OAuth;
var querystring = require('querystring');
var url         = require('url');

var app_token  = process.env.TWITTER_APP_TOKEN;
var app_secret = process.env.TWITTER_APP_SECRET;
var base_url   = process.env.BASE_URL || "http://127.0.0.1:3000";

var authorize_path = exports.authorize_path = "/twitter/authorize";
var login_path     = exports.login_path     = "/twitter/login";
var error_path     = exports.error_path     = "/twitter/error";
var logout_path    = exports.logout_path    = "/twitter/logout";

var get_request_token_url = "https://api.twitter.com/oauth/request_token";
var authorize_token_url   = "https://api.twitter.com/oauth/authenticate"
var access_token_url      = "https://api.twitter.com/oauth/access_token"
var logout_url            = "https://api.twitter.com/oauth/invalidate_token"

function getOAuth() {
  return new OAuth(
    get_request_token_url,
    access_token_url,
    app_token,
    app_secret,
    "1.0A",
    base_url + authorize_path,
    "HMAC-SHA1"
  );
}

exports.requestToken = function(req, res) {
  getOAuth().getOAuthRequestToken(function(err, token, secret, results) {
    if(err) {
      console.log(err);
      res.redirect(error_path);
      return;
    }

    var params = querystring.stringify({oauth_token: token});

    req.session.token = token;
    req.session.secret = secret;
    res.redirect(authorize_token_url + "?" + params);
  });
}

exports.authorize = function(req, res, location) {
  var parsed_url = url.parse(req.url, true);
  var params = parsed_url.query;
  getOAuth().getOAuthAccessToken(
    req.session.token,
    req.session.secret,
    params.oauth_verifier,
    function(error, access_token, access_token_secret, results) {
      if(error) {
        console.log(error);
        res.redirect(error_path);
        return;
       }

       req.session.access_token = access_token;
       req.session.access_token_secret = access_token_secret;

       res.redirect(location);
  });
}

exports.logout = function(req, res, cb) {
  req.session.access_token = null;
  req.session.access_token_secret = null;
  req.session.token = null;
  req.session.secret = null;
  cb();
}
