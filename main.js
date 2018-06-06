const fs = require('fs'), Twitter = require('twit');

// Get these at apps.twitter.com
const twitterConsumerKey = "";
const twitterConsumerSecret = "";
const twitterAccessToken = "";
const twitterAccessSecret = "";

// Setup twitter api access
const twitterApi = new Twitter({
	consumer_key:         twitterConsumerKey,
	consumer_secret:      twitterConsumerSecret,
	access_token:         twitterAccessToken,
	access_token_secret:  twitterAccessSecret
});

// Name of the .csv file from the archive.
const archiveFile = "tweets.csv";

// Array with the keywords to filter
var filterKeywords = [];
const filterFile = "filters.txt";

// Temporary array with the IDs of the tweets to delete.
var toDelete = [];

var removeQuotes = function(t) {
	return (t.replace(t[0], "")).replace(t[t.length - 1], "");
}

// Delete one tweet at a time.
function deleteThis() {
	// Ask the twitter api to delete the last item in the toDelete array.
	twitterApi.post("statuses/destroy", {id: toDelete[toDelete.length - 1].toString()}, function(err, data, response) {
		if(err == "undefined") // Make sure there's no errors
			console.log(err);

		// Remove the tweet we just deleted from his list. (Fuck off Fisk)
		toDelete.splice(toDelete.length - 1, 1);
		if(toDelete.length != 0) // Rerun that code if there's tweets left to delete.
			deleteThis();
	});
}

// Check if the filter file exist, if so, scan it.
try {
	fs.readFileSync(filterFile, "utf-8").toString().split("\n").forEach(function(l) {
		filterKeywords.push(l.replace("\r", ""));
	});
	console.log(filterFile + " was found and will be used!");
} catch (e) { 
	console.log(filterFile + " not found, moving on..."); 
}

// Read the Twitter archive .csv file.
try {
	fs.readFileSync(archiveFile, "utf-8").toString().split("\n").forEach(function(l) {
		var tweetId = l.split(",")[0]; // The first item in that array will ALWAYS be the id
		if(tweetId[0] == '"' && tweetId[1] != '"') { // Sometimes words get on separated lines, it just makes sure that they won't be loaded as IDs
			if(filterKeywords.length > 0) { // Is there filters or not ?
				var tweetText = removeQuotes(l.split(",")[5]).toString();
				for(f in filterKeywords) {
					if(tweetText.toLowerCase().includes(filterKeywords[f].toLowerCase())) {
						toDelete.push(removeQuotes(tweetId));
						break;
					}
				}
			} else {
				toDelete.push(removeQuotes(tweetId));
			}
		}
	});

	console.log("Time to delete tweets.");
	deleteThis();
} catch (e) {
	console.log(archiveFile + " wasn't found.");
}