const {Page, WebView, TextInput} = require('tabris');

function createWebView(url) {
	let page = new Page({
		title: 'Login'
	});
		
	let webView = new WebView({
		left: 0, right: 0, top: 0, bottom: 0,
		url: url
	}).appendTo(page);
	
	return page;
}

module.exports = {
	create: (url) => createWebView(url)
};
