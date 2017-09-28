import { Router } from 'express'

import search from './search'
import igAuth from './ig-auth'

const router = Router()


/*==============================
=            routes            =
==============================*/

router.use(search)
router.use(igAuth)


/*==============================
=            errors            =
==============================*/

/*----------  500  ----------*/

router.use(function (err, req, res, next) {
  console.log(err)
  res.status(500)
  res.json(err.message)
  // res.send('API error :(')
});


/*----------  fallback 404  ----------*/

router.get('*', function (req, res) {
  res.status(404).send('API not found :(');
})



/*==============================
=            export            =
==============================*/

export default router
