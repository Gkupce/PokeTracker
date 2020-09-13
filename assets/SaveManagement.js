const LAST_SESSION_KEY = "lastSession";

let SaveManagement = {
	hasLastSession: function() {
		return !!window.localStorage.getItem(LAST_SESSION_KEY);
	},
	
	saveAsLastSession: function(value) {
		if(!jQuery.isEmptyObject(value)) {
			window.localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(value));
		}
	},
	
	getLastSession: function() {
		return JSON.parse(window.localStorage.getItem(LAST_SESSION_KEY));
	}
}