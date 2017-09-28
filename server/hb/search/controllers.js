import * as rp from 'request-promise'
import { twitterHashtagCounts, igHashtagCounts } from './modules'



/*=========================================
=            relatedHashtagsIg            =
=========================================*/

async function chainCallsToIgApi (searchedHashtag, numberOfApiCalls, accessToken = process.env.IG_DEFAULT_ACCESS_TOKEN) {
  let callData = []
  let endpoint = 'https://api.instagram.com/v1/tags/' + searchedHashtag + '/media/recent?access_token=' + accessToken
  const options = {
      qs: { count: 33 },
      method: 'GET',
      json: true
    }

  let i = numberOfApiCalls

  while (i--) {
    let call = await rp({ uri: endpoint, ...options})

    callData = callData.concat(call.data)

    if (!call.pagination.next_url) {
      return callData
    } else {
      endpoint = call.pagination.next_url
    }
  }

  return callData;
}

export function relatedHashtagsIg (req, res, next) {
  const searchedHashtag = req.params.tag.toLowerCase() //to lower case because we later filter out the original hastag like this
  const re = /[^a-zA-Z0-9_ÂÃÄÀÁÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/

  if (re.test(searchedHashtag) || searchedHashtag === '') {
    res.json( {
      searchedHashtag: searchedHashtag,
      data: []
    })

    // don't go any further if req has special chars or is blank
    return
  }

  chainCallsToIgApi(searchedHashtag, 3)
  .then( (body) => {
    return igHashtagCounts(body) 
  })
  .then( (r) => {
    return r
      // remove all tags with less than 1 occurence
      //.filter(o => o.count > 1)

      // sort by count desc
      .sort((a, b) => b.count - a.count)

      // remove original tag
      .filter(o => o.text !== searchedHashtag)

      //remove tags with special characters
      .filter(o => {
        return !re.test(o.text)
      })

      //return first 50 results
      .slice(0, 50)

      // return in the form [{text: String, count: Int}, ...etc...]
      .map(o => {
        return { text: o.text, count: o.count }
      })

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