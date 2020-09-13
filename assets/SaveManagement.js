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
	},
	
	saveToJson: function(value, fileName) {
		let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(value));
		let dlAnchorElem = document.getElementById('downloadAnchorElem');
		dlAnchorElem.setAttribute("href", dataStr);
		dlAnchorElem.setAttribute("download", fileName + ".json");
		dlAnchorElem.click();
	},
	
	loadFromJson: function(file, callback) {
		let textType = /application\/json/;
		let result = {
			"error": false,
			"data": false
		};
		if (file.type.match(textType)) {
			let reader = new FileReader();
			
			reader.onload = function(e) {
				//Here the content has been read successfuly
				let content = reader.result;
				let contentObj;
				try {
					contentObj = JSON.parse(content);
				}
				catch (error) {
					//If the file contents aren't an actual json, fail the load
					result.error = "File format is incorrect.";
					callback(result);
					return;
				}
				
				if(SaveManagement.simpleFileCheck(contentObj)) {
					result.data = contentObj;
					callback(result);
				}
				else {
					result.error = "The file is not a valid tracker session.";
					callback(result);
				}
			}
			reader.onerror = function(e) {
				result.error = "The file failed loading.";
				callback(result);
			};
			
			reader.readAsText(file);
		}
		else {
			result.error = "Incorrect file type.";
			callback(result);
		}
	},
	
	simpleFileCheck: function(contentObj) {
		//Simple check to see if obtained json is close to expected file,
		// see that there are keys and each one in the object is a number
		let count = 0;
		for (const key in contentObj) {
			if (contentObj.hasOwnProperty(key)) {
				if(isNaN(Number(key))) {
					return false;
				}
				count++;
			}
		}
		return count;
	}
}