import rp from 'request-promise'
import { relatedHashtags, twitterHashtagCounts } from './modules'
import neo4j from 'neo4j'

require('dotenv').config()




/*=========================================
=            testneo4j            =
=========================================*/
var db = new neo4j.GraphDatabase(process.env.NEO4J_CONNECTION)

export function testNeo4j (req, res, next) {

  db.cypher({
      query: 'CREATE (u:User {email: {email}}) RETURN u',
      params: {
          email: 'default',
      },
  }, function (err, results) {
      if (err) throw err;
      var result = results[0];
      if (!result) {
          console.log('No user found.')
      } else {
          console.log(result)
      }
  });

};

/*===============================================
=            relatedHashtagsIg            =
================================================*/
export async function getRelatedHashtags (req, res, next) {
  const searchedHashtag = req.params.tag.toLowerCase() //to lower case because we later filter out the original hastag like this
  const re = relatedHashtags.hashtagValidationFormat

  if (re.test(searchedHashtag) || searchedHashtag === '') {
    res.json( {
      searchedHashtag: searchedHashtag,
      data: []
    })
    // don't go any further if req has special chars or is blank
    return
  }

  const rawPosts = await relatedHashtags.chainApiCalls(searchedHashtag, 3)
  const tagCounts = relatedHashtags.getTagCountsFromPosts(rawPosts)
  const filteredTagCounts = relatedHashtags.filterCounts(tagCounts, searchedHashtag)

  res.json(filteredTagCounts)
};


/*==============================================================
=            relatedHashtagsIg w promise method           =
==============================================================*/
export function getRelatedHashtagsPromise (req, res, next) {
  const searchedHashtag = req.params.tag.toLowerCase() //to lower case because we later filter out the original hastag like this
  const re = relatedHashtags.hashtagValidationFormat

  if (re.test(searchedHashtag) || searchedHashtag === '') {
    res.json( {
      searchedHashtag: searchedHashtag,
      data: []
    })
    // don't go any further if req has special chars or is blank
    return
  }

  relatedHashtags.chainApiCalls(searchedHashtag, 3)
  .then( (body) => {
    return relatedHashtags.getTagCountsFromPosts(body) 
  })
  .then( (r) => {
    return relatedHashtags.filterCounts(r, searchedHashtag)
  })
  .then( (r) => {
    return {searchedHashtag: searchedHashtag, data: r}
  })
  .then( (r) => {
    res.json(r)
  })
  .catch( (e) => {
    next(e)
  });

};



/*======================================
=            hashtag search            =
======================================*/

async function searchTagsEndpoint (searchedHashtag, accessToken = process.env.IG_DEFAULT_ACCESS_TOKEN) {
  let endpoint = 'https://api.instagram.com/v1/tags/search?q=' + searchedHashtag + '&access_token=' + accessToken
  const options = {
      method: 'GET',
      json: true
    }

  let call = await rp({ uri: endpoint, ...options})

  return call.data
}


export function searchTagIg (req, res, next) {
  const searchedHashtag = req.params.tag.toLowerCase()

  searchTagsEndpoint(searchedHashtag)
  .then( (r) => {
    res.json(r)
  })
  .catch( (e) => {
    next(e)
  });

};



/*=========================================
=            relatedHashtagsTwitter            =
=========================================*/


export function relatedHashtagsTwitter(req, res, next) {
  
  const searchedHashtag = req.params.tag.toLowerCase(); //to lower case because we later filter out the original hastag like this
  const re = /[^a-zA-Z0-9_ÂÃÄÀÁÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/;

  if (re.test(searchedHashtag) || searchedHashtag === '') {
    res.json( {
      searchedHashtag: searchedHashtag,
      data: []
    });
    return; // don't go any further if req has special chars or is blank
  }

  const host = 'api.twitter.com',
    endpoint = 'https://api.twitter.com/1.1/search/tweets.json',
    qs = {
      q: '%23' + searchedHashtag,
      count: 100,
      result_type: 'recent'
    },
    method = 'GET',
    headers = {
      'User-Agent': 'Hash Browns',
      'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAADYh1wAAAAAAIjC2to6%2F6ttkEvsLgD8do5RZkrw%3Dr70S3d6veQGZyWjJ2ro0G1qWmD6IxpvghVV2HlaWnfEdCRpTPU'
    },
    options = {
      uri: endpoint,
      qs: qs,
      method: method,
      headers: headers,
      json: true
    };

  rp(options)
  .then( (body) => {
    return twitterHashtagCounts(body);    
  })
  .then( (r) => {
    return r
      .filter(o => o.count > 1) // remove all tags with less than 1 occurence
      .sort((a, b) => b.count - a.count) // sort by count desc
      //.map(o => {return {text: o.text};}) // return as array of text strings
      .filter(o => o.text !== searchedHashtag); // remove original tag
  })
  .then( (r) => {
    return {searchedHashtag: searchedHashtag, data: r};
  })
  .then( (r) => {
    res.json(r);
  })
  .catch( (e) => {
    next(e);
  });

};