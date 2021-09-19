import fs from 'fs';
import got from 'got';

const api = 'https://api.scryfall.com';
const delay = 100;

const set = (set) => `${api}/sets/${set}`;
const card = (set, number) => `${api}/sets/cards/${set}/${number}`;
const setCards = (set) => `${api}/cards/search?q=${encodeURIComponent(`++e:${set}`)}&format=json`;

let cards = {
	cardData: [],
	[Symbol.asyncIterator]() {
		return {
			index: 0,
			cardData: this.cardData,

			async next() {
				if (this.index < this.cardData.length) {
					// process card
					let i = this.index;
					const card = this.cardData[i];
					this.index++;

					console.log(`Downloading image for '${card.name}'`);
					// download the image
					// xmage requires the card collector number in the filename to indicate alternate art versions of a card
					let promise = new Promise((resolve, reject) => {
						let stream = 
							got.stream(card.imageUri)
							.pipe(fs.createWriteStream(card.filePath))
							.on('finish', () => {
								setTimeout(() => {
									resolve();
								}, delay);
							})
							.on('error', (error) => {
								setTimeout(() => {
									reject(error);
								}, delay);
							});
					});

					const download = await promise.catch((error) => {
						console.log('Download error: ', error);
					});
					
					return Promise.resolve({ 
						done: false, 
						value: this.cardData[i]
					})
				} else {
					return Promise.resolve({ 
						done: true 
					});
				}
			}
		}
	}
};

async function processPageAsync(set, url) {
	const body = await got.get(url).json().catch((error) => {
		console.log('An error occured while trying to query ScryFall');
		console.log(error);

		return Promise.reject(error);
	});

	let index = 0;
	for (const card of body.data) {
		// check if it this card has alternate art by seeing if a card with a duplicate name exists
		// scryfall's default sort is by name, so we just look before or after the current card
		let alternate = false;
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
			for (const card_face of card.card_faces) {
				cards.cardData.push({
					name: card_face.name,
					imageUri: card_face.image_uris.normal,
					filePath: `./${set}/${card_face.name}${alternate ? `.${card.collector_number}` : ''}.full.jpg`
				});
			}
		} else {
			if (card.name.indexOf('//') !== -1) {
				card.name = card.name.replace('//', '-');
			}

			cards.cardData.push({
				name: card.name,
				imageUri: card.image_uris.normal,
				filePath: `./${set}/${card.name}${alternate ? `.${card.collector_number}` : ''}.full.jpg`
			});
		}

		index++;
	}

	if (body.has_more) {
		return await processPageAsync(set, body.next_page);
	} else {
		// download cards
		for await (let card of cards) {
			console.log(`Downloaded image for '${card.name}'`);
		}

		return Promise.resolve();
	}
}

async function downloadImagesAsync(set) {
	// perform initial search
	console.log(`Downloading images for ${set}`);

	if (!fs.existsSync(`./${set}`)) {
		fs.mkdirSync(`./${set}`);
	}

	const result = await processPageAsync(set, setCards(set)).catch((error) => {
		console.log('error: ', error);
		process.exit(0);
	});

	console.log('Done downloading images');
	process.exit(0);
}

function printUsage() {
	console.log('Usage:');
	console.log('./getimages-win.exe <set>');
	console.log('./getimages-win.exe help');
}

if (process.argv.length > 2) {
	const set = process.argv[2].toUpperCase();

	if (set === 'HELP') {
		printUsage();
		process.exit(0);
	} else {
		downloadImagesAsync(set);
	}
} else {
	printUsage();
	process.exit(0);
}

