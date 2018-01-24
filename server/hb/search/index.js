import { Router } from 'express'
import { testNeo4j, getRelatedHashtags } from './controllers'
import asyncMiddleware from './../../utils/asyncMiddleware'

const router = Router()


/*==============================
=            routes            =
==============================*/

router.use(function (req, res, next) { 
  res.setHeader('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL_ALLOW_ORIGIN_HB)
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  next()
})


// router.get('/search/twitter/:tag', relatedHashtagsTwitter)
// router.get('/search/ig/:tag', getRelatedHashtags)

// router.get('/search/:tag', getRelatedHashtags)
router.get('/search/:tag', asyncMiddleware(getRelatedHashtags))

// router.get('/searchtag/:tag', searchTagIg)

router.get('/testneo4j/:tag', testNeo4j)


export default router
