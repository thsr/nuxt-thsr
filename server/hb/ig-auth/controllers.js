import { instagram } from 'instagram-node'
const ig = instagram()

require('dotenv').config()

const config = {
  instagram_redirect_uri: process.env.IG_REDIRECT_URI,
  instagram_client_id: process.env.IG_CLIENT_ID,
  instagram_client_secret: process.env.IG_CLIENT_SECRET
}

/*=========================================
=            authorizeUser                =
=========================================*/


export function authorizeUser (req, res) {
  ig.use({
    client_id: config.instagram_client_id,
    client_secret: config.instagram_client_secret
  });
  res.redirect(ig.get_authorization_url(config.instagram_redirect_uri, { scope: ['public_content'] }));
}

/*==================================
=            handleauth            =
==================================*/


export function handleAuth (req, res, next) {

  ig.authorize_user(req.query.code, config.instagram_redirect_uri, function(err, result) {
    if (err) {
      next(err);
    } else {
      res.cookie('instaToken', result.access_token, { maxAge: 900000 });
      res.redirect('/');
    }
  });

}


/*==================================
=            logout                =
==================================*/


export function logout (req, res, next) {

  res.clearCookie('instaToken');

  // res.redirect('/');
  res.redirect('https://instagram.com/accounts/logout/');

}