import { Router } from 'express'

import users from './users'
import search from './search'
import igAuth from './ig-auth'

const router = Router()


/*==============================
=            routes            =
==============================*/

router.use(users)
router.use(search)
router.use(igAuth)


/*==============================
=            errors            =
==============================*/

/*----------  500  ----------*/

router.use(function (err, req, res, next) {
  console.log(err.stack);
  res.status(500);
  res.send('API error :(');
});


/*----------  fallback 404  ----------*/

router.get('*', function (req, res) {
  res.status(404).send('API not found :(');
})



/*==============================
=            export            =
==============================*/

export default router
