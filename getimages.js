var async = require('async');
var request = require('request');
var fs = require('fs');

const api = 'https://api.scryfall.com';
var delay = 100;

var set = (set) => `${api}/sets/${set}`;
var card = (set, number) => `${api}/sets/cards/${set}/${number}`;
var setCards = (set) => `${api}/cards/search?q=${encodeURIComponent(`++e:${set}`)}&format=json`;

function processPage (set, url, fns, done) {
	request({
		url: url,
		json: true
	}, function (error, response, body) {
		var stop = false;

		if (error || (!response) || (response && response.statusCode !== 200)) {
			console.log('An error occured while trying to query ScryFall');
			console.log(error);
			console.log(`${statusCode}: ${body}`);
			stop = true;
		} else {
			body.data.forEach((card, index) => {
				// check if it this card has alternate art by seeing if a card with a duplicate name exists
				// scryfall's default sort is by name, so we just look before or after the current card
				var alternate = false;
				if (body.data[index-1]) {
					if (card.name === body.data[index-1].name) {
						alternate = true;
					}
				}

				if (body.data[index+1]) {
					if (card.name === body.data[index+1].name) {
						alternate = true;
					}
				}

				// check if this is a multi-face card
				if (card.card_faces && card.card_faces.length > 0 && card.layout != 'split') {
					// process each face as an individual card
					card.card_faces.forEach((card_face) => {
						fns.push((next) => {
							console.log(`Downloading image for '${card_face.name}'`);
							if (!fs.existsSync(`./${set}`)) {
								fs.mkdirSync(`./${set}`);
							}
							// download the image
							// xmage requires the card collector number in the filename to indicate alternate art versions of a card
							var stream = request(card_face.image_uris.normal)
								.pipe(fs.createWriteStream(`./${set}/${card_face.name}${alternate ? `.${card.collector_number}` : ''}.full.jpg`))
								.on('finish', () => {
									setTimeout(() => {
										return next();
									}, delay);
								});
						});
					});
				} else {
					fns.push((next) => {
						console.log(`Downloading image for '${card.name}'`);
						if (!fs.existsSync(`./${set}`)) {
							fs.mkdirSync(`./${set}`);
						}

						if (card.name.indexOf('//') !== -1) {
							card.name = card.name.replace('//', '-');
						}

						// download the image
						// xmage requires the card collector number in the filename to indicate alternate art versions of a card
						var stream = request(card.image_uris.normal)
							.pipe(fs.createWriteStream(`./${set}/${card.name}${alternate ? `.${card.collector_number}` : ''}.full.jpg`))
							.on('finish', () => {
								setTimeout(() => {
									return next();
								}, delay);
							});
					});
				}
			});
		}

		setTimeout(() => {
			if (stop) {
				process.nextTick(() => {
					done();
				});
			} else {
				if (body.has_more) {
					process.nextTick(() => {
						processPage(set, body.next_page, fns, done);
					});
				} else {
					process.nextTick(() => {
						done();
					});
				}
			}
		}, delay);
	});
}

function downloadImages (set) {
	// perform initial search
	console.log(`Downloading images for ${set}`);
	var fns = [];
	processPage(set, setCards(set), fns, () => {
		async.waterfall(fns, function (result) {
			console.log('Done downloading images');
			process.exit(0);
		});
	});
}

function printUsage() {
	console.log('Usage:');
	console.log('./getimages-win.exe <set>');
	console.log('./getimages-win.exe help');
}

if (process.argv.length > 2) {
	var set = process.argv[2].toUpperCase();

	if (set === 'HELP') {
		printUsage();
		process.exit(0);
	} else {
		downloadImages(set);
	}
} else {
	printUsage();
	process.exit(0);
}

