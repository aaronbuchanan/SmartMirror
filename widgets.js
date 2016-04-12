var request = require('request');
var cheerio = require('cheerio');
var config = require('./config');

module.exports.weather = function (req, res) {
	request({url: config.widget.weather.url, json: true}, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(response);
		}
	})
}

module.exports.news = function (req, res) {
	request(config.widget.news.url, function (error, response, xml) {
		if (error || response.statusCode !== 200)
			return;
		
		var parseString = require('xml2js').parseString;
		parseString(xml, function (err, result) {
			var news = [];
			items = result.rss.channel[0].item;
			items.forEach(function(item) {
				var entry_news = new Object();
				entry_news.title = item.title;
				entry_news.description = item.description;
				entry_news.category = item.category;
				entry_news.img = item.thumbnail[0].$.url.replace("medium2", "bigger");
				news.push(entry_news);
			});
			res.send(JSON.stringify(news));
		});
	});
}

module.exports.agario = function (req, res) {
  res.sendFile(__dirname + '/public/agario.html');
}

var movies = [];
request(config.widget.cinema.url, function (error, response, html) {
		if (error || response.statusCode !== 200)
			return;
		
		var $ = cheerio.load(html);
		//var movies = []
		
		$('.hred').each(function(i, elem) {
			var movie = new Object();
			movie.title = $(this).find('.meta-title-link').text().trim();
			movie.img = $(this).find('.thumbnail-img').attr('data-src');
			movie.duration = $(this).find('.meta-body-item').text();
			var indexDuration = movie.duration.indexOf("|");
			movie.duration = movie.duration.substring(indexDuration + 1, indexDuration + 10).trim().replace(" ", "").replace("min", "");
			movie.pressRating = $(this).find('.stareval-note').first().text().trim();
			movie.peopleRating = $(this).find('.stareval-note').eq(1).text().trim();
			movie.totalRating = parseInt(movie.pressRating) + parseInt(movie.peopleRating);
			movie.hours = [];
			$(this).find('.showtimes-format').first().find('.hours-item-value').each(function(i, elem) {
				movie.hours.push($(this).text());
			});
			
			if (!isNaN(movie.totalRating) && movie.totalRating > 1 && movie.hours.length > 0)
				movies.push(movie);
		});
		
		//movies.sort(function(a, b) { return (a.totalRating > b.totalRating) ? -1 : 1;} );
		//res.send(JSON.stringify(movies));
	});

module.exports.cinema = function (req, res) {
	res.send(JSON.stringify(movies));
}