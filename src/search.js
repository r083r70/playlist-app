const {Page, CollectionView,  ScrollView, Composite, TextInput, TextView, ImageView, ActivityIndicator} = require('tabris');
const network = require('./network.js');

let searchCallback = (item) => {}
let searchItems = [];

// checking if an element is in an array (by mbid)
function inArray(item, array) {
	for(var i = 0; i < array.length; i++)
		if(array[i].mbid == item.mbid && array[i].url == item.url)
			return true;
	return false;
}

// creating a cell for the collectionView
function createCell() {
	let cell = new Composite();
	
	let borderContainer = new Composite({
		id: 'borderContainer',
		left: 5, right: 5, top: 1, bottom: 2,
		cornerRadius: 5,
		background: '#1fd660'
	}).appendTo(cell);

	let container = new Composite({
		id: 'container',
		left: 1, right: 1, bottom: 1, top: 1,
		cornerRadius: 5,
		background: '#191414'
	}).appendTo(borderContainer);

	new ImageView({
		id: 'itemImage',
		left: 1, top: 1,
		width: 80, height: 80,
		scaleMode: 'fit'	
	}).appendTo(container);

	new TextView({
		id: 'nameText',
		top: 9, left: ['#itemImage', 7], right: 7,
		alignment: 'left',
		maxLines: 2,
		font: '19px',
		textColor: '#fff'
	}).appendTo(container);

	new TextView({
		id: 'artistText',
		top: ['#nameText', 5], left: ['#itemImage', 7], right: 9,
		alignment: 'right',
		maxLines: 1,
		font: '15px',
		textColor: '#fff'
	}).appendTo(container);

	return cell;
}

// filling a cell of the collectionView
function updateCell(view, index) {
	item = searchItems[index];
	view.find('#borderContainer').first().item = item;
	view.find('#itemImage').set('image', {src: item.image});
	view.find('#nameText').set('text', item.name);
	view.find('#artistText').set('text', item.artist);
}

let lastInput = '';

// updating the content of the collectionView
function updateCollection(collectionView, input) {
	lastInput = input;

	if(input.length == 0) {
		collectionView.remove(0, collectionView.itemCount);
		searchItems = [];
		return Promise.resolve('no input');
	}
	
	return network.searchTrack(input)
		.then(songsArray => {
			var i = 0;
			
			// controllo super stupido per vedere se nel frattempo è cambiato l'input
			if(input != lastInput)
				return Promise.resolve('too_late');
			
			searchItems = searchItems.reduce((prev, cur) => {
				if(!inArray(cur, songsArray)) {
					collectionView.remove(i);
					return prev;
				}
				i++;
				return prev.concat(cur);
			}, []);
			
			var index = searchItems.length;
		
			songsArray.map(song => {
				// controllo super stupido per sapere se c'è un immagine.
				if(song.image !== undefined && song.image.length > 2 && song.image[2]['#text'].length != 0) {
					if(!inArray(song, searchItems)) {
						searchItems.push({name: song.name, artist: song.artist, image: song.image[2]['#text'], mbid: song.mbid, url: song.url});
						collectionView.insert(index++);
					}
				}
			});
			collectionView.reveal(0);
		})
}

// creating the search page
function createSearch() {
	searchItems = [];
	
	// the page
	let page = new Page({
		title: 'Search'
	});
	
	// the text input for the research
	let textInput = new TextInput({
		centerX: 0, top: 20,
		width: 300,
		borderColor: '#1fd660',
		message: 'song title',
		enterKeyType: 'search'
	}).appendTo(page);
	
	// the scrollView
	let scrollView = new ScrollView({
		left: 0, right: 0, top: [textInput, 5], bottom: 0,
		direction: 'vertical'
	}).appendTo(page);
	
	// the collectionView that contains the cells
	let collectionView = new CollectionView({
		left: 0, right: 0, top: 0, bottom: 0,
		itemCount: 0,
		cellHeight: 87,
		createCell: () => createCell(),
		updateCell: (view, index) => updateCell(view, index)
	}).appendTo(scrollView);
	
	collectionView.on('select', ({index}) => searchCallback(searchItems[index]));
	
	// when the search button is pressed
	textInput.on('accept', () => {
		textInput.focused = false;
		
		let activityIndicator = new ActivityIndicator({
			centerX: 0, centerY: 0
		}).appendTo(page);
		
		updateCollection(collectionView, textInput.text)
			.then(() => activityIndicator.dispose())
			.catch(() => activityIndicator.dispose());
	});
	
	// when the text change
	textInput.on('input', () => updateCollection(collectionView, textInput.text));
	
	return page;
}

module.exports = {
	create: () => createSearch(),
	setSearchCallback: (f) => { searchCallback = f; }
};
