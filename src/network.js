const HOST = 'https://warm-refuge-37740.herokuapp.com/api';

const SEARCH_URL = HOST + '/search-track?track=INPUT_TEXT&id=';
const CHECK_URL = HOST + '/check-id?id=';
const LOGIN_URL = HOST + '/login-spotify?id=';

const SIMILAR_URL = HOST + '/similar-tracks?track=INPUT_TRACK&artist=INPUT_ARTIST&id=';
const CREATE_URL = HOST + '/create-playlist?name=INPUT_NAME&tracks=INPUT_TRACKS&id=';

function getId() { return localStorage.getItem('id_key') || 'none'; }

function checkId() {
	var id = getId();
	return fetch(CHECK_URL + id).then(response => response.json());
}

function searchTrack(text) {
	var id = getId();
	return fetch(SEARCH_URL.replace('INPUT_TEXT', encodeURIComponent(text)) + id).then(response => response.json());
}

function loginSpotify() {
	var id = getId();
	return fetch(LOGIN_URL + id).then(response => response.json()).then(json => json.login_url);
}

function similarTracks(track, artist) {
	var id = getId();
	return fetch(SIMILAR_URL.replace('INPUT_TRACK', encodeURIComponent(track)).replace('INPUT_ARTIST', encodeURIComponent(artist)) + id).then(response => response.json());
}

function encodeTracks(tracks) {
	return encodeURIComponent(tracks
		.map(track => { return track.name + '%%' + track.artist; })
		.reduce((prev, cur) => {
			if(prev.length == 0)
				return cur;
			return prev + '%%%' + cur;
		}, ''));
}

function createPlaylist(name, tracks) {
	var id = getId();
	return fetch(CREATE_URL.replace('INPUT_NAME', encodeURIComponent(name)).replace('INPUT_TRACKS', encodeTracks(tracks)) + id, {method: 'POST'}).then(response => response.json());
}

// TODO: DOING THE CATCHes

module.exports = {
	searchTrack: (text) => searchTrack(text),
	checkId: () => checkId(),
	loginSpotify: () => loginSpotify(),
	similarTracks: (track, artist) => similarTracks(track, artist),
	createPlaylist: (name, tracks) => createPlaylist(name, tracks)
};
