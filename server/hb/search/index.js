import { Router } from 'express'
import { getRelatedHashtags, searchTagIg, relatedHashtagsTwitter } from './controllers'

const router = Router()

require('dotenv').config()

/*==============================
=            routes            =
==============================*/

router.use(function (req, res, next) { 
  res.setHeader('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL_ALLOW_ORIGIN_HB) // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Methods', 'GET') // Request methods you wish to allow
  // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // Request headers you wish to allow
  // res.setHeader('Access-Control-Allow-Credentials', true); // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
  next() // Pass to next layer of middleware
})


router.get('/search/twitter/:tag', relatedHashtagsTwitter)
router.get('/search/ig/:tag', getRelatedHashtags)

router.get('/search/:tag', getRelatedHashtags)

router.get('/searchtag/:tag', searchTagIg)


export default router
