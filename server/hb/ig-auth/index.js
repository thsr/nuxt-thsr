import { Router } from 'express'
import { authorizeUser, handleAuth, logout } from './controllers'

const router = Router()

/*==============================
=            routes            =
==============================*/

router.use(function (req, res, next) { 
  // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080'); // Website you wish to allow to connect
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Request methods you wish to allow
  // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // Request headers you wish to allow
  // res.setHeader('Access-Control-Allow-Credentials', true); // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
  next(); // Pass to next layer of middleware
});



router.get('/ig_auth/authorize_user', authorizeUser);
router.get('/ig_auth/handle_auth', handleAuth);
router.get('/ig_auth/logout', logout);


export default router
