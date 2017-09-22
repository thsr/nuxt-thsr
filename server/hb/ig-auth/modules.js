import { findIndex } from 'lodash'



/*===============================
=            twitter            =
===============================*/


export function hashtagCountsTwitter(input) {
  var statuses = input.statuses;
  var counts = [];

  for (var j = statuses.length - 1; j >= 0; j--) {
    var usersFollowers = statuses[j].user.followers_count;

    for (var i = statuses[j].entities.hashtags.length - 1; i >= 0; i--) {
      var hashtagText = statuses[j].entities.hashtags[i].text.toLowerCase(); // to lower case so that we can do distincts

      var indexInCounts = findIndex(counts, ['text', hashtagText]);

      if (indexInCounts == -1) {
        counts.push({text: hashtagText, count: 1});
      } else {
        counts[indexInCounts].count++;
      }
    }
  }

  return counts;
}

export function hashtagCountsTwitterWithExtras(input) {
  var statuses = input.statuses;
  var counts = [];

  for (var j = statuses.length - 1; j >= 0; j--) {
    var usersFollowers = statuses[j].user.followers_count;

    for (var i = statuses[j].entities.hashtags.length - 1; i >= 0; i--) {
      var hashtagText = statuses[j].entities.hashtags[i].text.toLowerCase();

      var indexInCounts = findIndex(counts, ['text', hashtagText]);
      // console.log("state of count", JSON.stringify(counts));
      // console.log("hashtagText", hashtagText);
      // console.log("indexInCounts", indexInCounts);
      //console.log("counts[indexInCounts].text", counts[indexInCounts].text);

      if (indexInCounts == -1) {
        counts.push({text: hashtagText, count: 1, followers: usersFollowers});
      } else {
        counts[indexInCounts].count++;
        counts[indexInCounts].followers = Math.round( ( counts[indexInCounts].followers + usersFollowers ) / 2 );
      }
    }
  }

  var countsWMultiply = counts.map( (o) =>{
    var weightCount = 30;
    var weightFollowers = 1;
    return {text: o.text, count: o.count, followers: o.followers, mult: Math.round((o.count * weightCount + o.followers * weightFollowers) / (weightCount + weightFollowers))};
  });

  var countsOrdered = countsWMultiply.sort((a, b) => b.count - a.count);

  return counts;
}

export function orderCounts(input) {
  return input.sort((a, b) => b.count - a.count);
}
