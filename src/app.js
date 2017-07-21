const {NavigationView, ui} = require('tabris');
const home = require('./home.js');
const webview = require('./webview.js');
const searcher = require('./search.js');
const playlist = require('./playlist.js');

const network = require('./network.js');

ui.statusBar.background = '#66bb6a';
ui.statusBar.theme = 'light';

let navigationView = new NavigationView({
	left: 0, right: 0, top: 0, bottom: 0,
	toolbarColor: '#43a047'
}).appendTo(ui.contentView);

let pages = [];
var currentPage;

// remove the last page
function disposeLastPage() {
	var lastPage = pages.pop();
	lastPage.dispose();
}

// creating and seting up a home page
function setupHome() {
	home.setButtonCallback((id) => network.loginSpotify(id).then(url => setupWebview(url)));
	currentPage = home.create().appendTo(navigationView);
	pages.push(currentPage);
}

// creating and seting up a webview page
function setupWebview(url) {
	currentPage = webview.create(url).appendTo(navigationView);
	pages.push(currentPage);
	currentPage.on('dispose', () => main());
}

// creating and seting up a search page
function setupSearch() {
	while(pages.length > 0)
		disposeLastPage();
	
	searcher.setSearchCallback((item) => setupPlaylist(item));
	searcher.create().appendTo(navigationView);
}

// creating and seting up a playlist page
function setupPlaylist(item) {
	playlist.create(item.name, item.artist).appendTo(navigationView);
}

// checking for which main page we need
function main() {
	network.checkId()
	.then(json => json.error)
	.then(text => {
		window.plugins.toast.showShortBottom(text);
		var logged = (text == 'identification success');
	
		if(logged)
			setupSearch();
		else if(pages.length == 0)
			setupHome();
	})
	.catch(() => { });
}

main();

