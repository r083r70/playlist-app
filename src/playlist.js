const {Page, CollectionView,  ScrollView, Composite, TextView, ImageView, Button, ActivityIndicator} = require('tabris');
const network = require('./network.js');

let playlistItems = [];
let collectionViewPlaylist;

function manageEndPan(event) {
	let {translationX, velocityX, target} = event;
	
	var beyondCenter = Math.abs(translationX) > (target.bounds.width / 2);
	var speedPan = Math.abs(velocityX) > 200;
	var sameDirection = translationX * velocityX > 0;
	
	if(sameDirection && (beyondCenter || speedPan))
		target.animate(
			{transform: {translationX: (translationX > 0? 1 : -1) * (target.bounds.width + 6)}},
			{duration: 200, easing: 'ease-in'}
		).then(() => {
			var i = playlistItems.indexOf(target.item);
			playlistItems.splice(i, 1);
			collectionViewPlaylist.remove(i);
			setTimeout(() => target.animate({transform: {translationX: 0}}, {duration: 0, easing: 'linear'}), 300);
		});
	else
		target.animate(
			{ transform : { translationX: 0 } },
			{ duration: 200, easing: 'ease-out' }
		);
}

function managePan(event) {
	let {translationX, state, target} = event;
	target.transform = {translationX: translationX};
	
	if(state === 'end')
		manageEndPan(event);
}

function createCell() {
	let cell = new Composite();
	
	let borderContainer = new Composite({
		id: 'borderContainer',
		left: 5, right: 5, top: 1, bottom: 2,
		cornerRadius: 5,
		background: '#1fd660'
	}).appendTo(cell);
	
	borderContainer.on('panHorizontal', event => managePan(event));
	
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

function updateCell(view, index) {
	item = playlistItems[index];
	view.find('#borderContainer').first().item = item;
	view.find('#itemImage').set('image', {src: item.image});
	view.find('#nameText').set('text', item.name);
	view.find('#artistText').set('text', item.artist);
}

function getSimilars(track, artist) {
	playlistItems = [];
	
	return network.similarTracks(track, artist)
		.then(songsArray => {
			var i = 0;
			songsArray.map(song => {
				if(song.image !== undefined && song.image.length > 2 && song.image[2]['#text'].length != 0) {
					playlistItems.push({name: song.name, artist: song.artist.name, image: song.image[2]['#text'], mbid: song.mbid, url: song.url});
					collectionViewPlaylist.insert(i++);
				}
			});
			collectionViewPlaylist.reveal(0);
		});
}

function createPlaylist(track, artist) {
	let page = new Page({
		title: 'Playlist'
	});
	
	let button = new Button({
		left: 21, right: 21, bottom: 5,
		height: 63,
		text: 'CREATE PLAYLIST',
		textColor: '#fff',
		background: '#1fd660',
		font: 'bold 22px'
	}).appendTo(page);
	
	button.on('select', () => network.createPlaylist('Playlist: ' + track + ' - ' + artist, playlistItems)
		.then(json => json.error)
		.then(text => window.plugins.toast.showShortBottom(text))
	);
	
	let scrollView = new ScrollView({
		left: 0, right: 0, top: 0, bottom: [button, 5],
		direction: 'vertical'
	}).appendTo(page);
	
	collectionViewPlaylist = new CollectionView({
		left: 0, right: 0, top: 0, bottom: 0,
		itemCount: 0,
		cellHeight: 87,
		createCell: () => createCell(),
		updateCell: (view, index) => updateCell(view, index)
	}).appendTo(scrollView);
	
	let activityIndicator = new ActivityIndicator({
		centerX: 0, centerY: 0
	}).appendTo(page);
		
	getSimilars(track, artist)
		.then(() => activityIndicator.dispose())
		.catch(() => activityIndicator.dispose());
	
	return page;
}

module.exports = {
	create: (track, artist) => createPlaylist(track, artist)
}
