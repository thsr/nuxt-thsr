import { findIndex } from 'lodash'
import * as rp from 'request-promise'

require('dotenv').config()

/*=================================
=            Instagram            =
=================================*/

export let relatedHashtags = {

  hashtagValidationFormat: /[^a-zA-Z0-9_ÂÃÄÀÁÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/,

  /**
   * Process a chain of calls to IG api endpoint https://api.instagram.com/v1/tags/-foobar-/media/recent to get more than max API post count
   * @param {string} searchedHashtag - searched hashtag
   * @param {number} numberOfApiCalls - number of chained calls made to the endpoint
   * @param {string} [accessToken=env_variable] - Ig API access token
   * @returns {Array} 'data' array from response from endpoint
   *
   */
  chainApiCalls: async function (searchedHashtag, numberOfApiCalls, accessToken = process.env.IG_DEFAULT_ACCESS_TOKEN) {
    let callData = []
    let endpoint = 'https://api.instagram.com/v1/tags/' + searchedHashtag + '/media/recent?access_token=' + accessToken
    const options = {
        qs: { count: 30 },
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

    console.log(callData.length)

    return callData
  },

  /**
   * Use commented lines to return [{text: hashtagText, count: cnt, likes: postLikes}, ...]
   * @param {Array} input - 'data' array from response from endpoint https://api.instagram.com/v1/tags/-foobar-/media/recent
   * @returns {Array} Array of the form [{text: hashtagText, count: cnt}, ...]
   * 
   */
  getTagCountsFromPosts: function (input) {
    var posts = input
    var counts = []

    for (var j = posts.length - 1; j >= 0; j--) {
      //var postLikes = posts[j].likes.count

      for (var i = posts[j].tags.length - 1; i >= 0; i--) {
        var hashtagText = posts[j].tags[i].toLowerCase() // to lower case so that we can do distincts

        var indexInCounts = findIndex(counts, ['text', hashtagText])

        if (indexInCounts == -1) {
          //counts.push({text: hashtagText, count: 1, likes: postLikes})
          counts.push({text: hashtagText, count: 1})
        } else {
          counts[indexInCounts].count++
          //counts[indexInCounts].likes += postLikes
        }
      }
    }

    return counts
  },

  /**
   *
   * @param {Array} input - Array of the form [{text: hashtagText, count: cnt}, ...]
   * @returns {Array} Array of the form [{text: hashtagText, count: cnt}, ...] filtered out
   *
   */
  filterCounts: function (r, searchedHashtag) {
    return r
      // remove all tags with less than 1 occurence
      //.filter(o => o.count > 1)

      // sort by count desc
      .sort((a, b) => b.count - a.count)

      // remove original tag
      .filter(o => o.text !== searchedHashtag)

      //remove tags with special characters
      .filter(o => {
        return !this.hashtagValidationFormat.test(o.text)
      })

      //return first 50 results
      .slice(0, 50)

      // return in the form [{text: String, count: Int}, ...etc...]
      .map(o => {
        return { text: o.text, count: o.count }
      })
  }

}



/*===============================
=            twitter            =
===============================*/

export function twitterHashtagCounts(input) {
  var statuses = input.statuses
  var counts = []

  for (var j = statuses.length - 1; j >= 0; j--) {

    for (var i = statuses[j].entities.hashtags.length - 1; i >= 0; i--) {
      var hashtagText = statuses[j].entities.hashtags[i].text.toLowerCase() // to lower case so that we can do distincts

      var indexInCounts = findIndex(counts, ['text', hashtagText])

      if (indexInCounts == -1) {
        counts.push({text: hashtagText, count: 1})
      } else {
        counts[indexInCounts].count++
      }
    }
  }

  return counts
}

export function hashtagCountsTwitterWithExtras(input) {
  var statuses = input.statuses
  var counts = []

  for (var j = statuses.length - 1; j >= 0; j--) {
    var usersFollowers = statuses[j].user.followers_count

    for (var i = statuses[j].entities.hashtags.length - 1; i >= 0; i--) {
      var hashtagText = statuses[j].entities.hashtags[i].text.toLowerCase()

      var indexInCounts = findIndex(counts, ['text', hashtagText])
      // console.log("state of count", JSON.stringify(counts));
      // console.log("hashtagText", hashtagText);
      // console.log("indexInCounts", indexInCounts);
      //console.log("counts[indexInCounts].text", counts[indexInCounts].text);

      if (indexInCounts == -1) {
        counts.push({text: hashtagText, count: 1, followers: usersFollowers})
      } else {
        counts[indexInCounts].count++
        counts[indexInCounts].followers = Math.round( ( counts[indexInCounts].followers + usersFollowers ) / 2 )
      }
    }
  }

  var countsWMultiply = counts.map( (o) =>{
    var weightCount = 30;
    var weightFollowers = 1;
    return {text: o.text, count: o.count, followers: o.followers, mult: Math.round((o.count * weightCount + o.followers * weightFollowers) / (weightCount + weightFollowers))};
  })

  var countsOrdered = countsWMultiply.sort((a, b) => b.count - a.count)

  return counts
}

export function orderCounts(input) {
  return input.sort((a, b) => b.count - a.count)
}
