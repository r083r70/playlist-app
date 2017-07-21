const {Page, Button, TextInput} = require('tabris');
const network = require('./network.js');

let buttonCallback = () => {};

function createHome() {
	let page = new Page({
		title: 'Home',
		background: '#191414'
	});
	
	let idTextInput = new TextInput({
		left: 15, right: 15, top: 50,
		borderColor: '#1fd660',
		textColor: '#fff',
		enterKeyType: 'done'
	}).appendTo(page);
	
	idTextInput.on('accept', ({text}) => localStorage.setItem('id_key', text));
	
	let button = new Button({
		left: 21, right: 21, top: [idTextInput, 20],
		height: 63,
		text: 'LOG IN',
		textColor: '#fff',
		background: '#1fd660',
		font: 'bold 22px'
	})
	.on('select', () => {
		localStorage.setItem('id_key', idTextInput.text);
		buttonCallback();
	})
	.appendTo(page);	
	
	return page;
}

module.exports = {
	create: () => createHome(),
	setButtonCallback: (f) => { buttonCallback = f; }
};
