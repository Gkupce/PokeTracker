const pokeApiBaseUrl = "https://pokeapi.co/api/v2/";

function loadGens(callback) {
	$.get(pokeApiBaseUrl + "generation", function(response) {
		var generations = [];
		for (let i = 0; i < response.results.length; i++) {
			const generation = response.results[i];
			
			let genNum = getNumFromUrl(generation.url);
			let splitName = response.results[i].name.split("-");
			
			let genName = capitalizeFirstLetter(splitName[0]) + " " + splitName[1].toUpperCase()
			generations.push({
				genNum: genNum,
				genName: genName
			});
		}
		
		callback(generations);
	});
}

function loadPokemonFromGens(genNums, callback) {
	let receivedGens = 0;
	let totalPoke = 0;
	let receivedPoke = 0;
	let obtainedPokemon = {};
	
	for(let i = 0; i < genNums.length; i++) {
		$.get(pokeApiBaseUrl + "generation/" + genNums[i] + "/", function(response) {
			totalPoke += response.pokemon_species.length;
			receivedGens++;
			for(let j = 0; j < response.pokemon_species.length; j++) {
				getPokemonDetails(response.pokemon_species[j].url, function(pokeData){
					obtainedPokemon[pokeData.id] = pokeData;
					receivedPoke++;
					if(receivedGens === genNums.length
						&& receivedPoke === totalPoke
					) {
						callback(obtainedPokemon);
					}
				});
			}
		});
	}
}

function getPokemonDetails(url, callback) {
	var pokeData = {};
	$.get(url, function(response) {
		pokeData.id = response.id;
		pokeData.name = capitalizeFirstLetter(response.name);
		if(response.evolves_from_species) {
			//Not base mon
			//get id num of previous form
			pokeData.evolvesFromId = getNumFromUrl(response.evolves_from_species.url);
		}
		$.get(getDefaultForm(response.varieties).url, function(resp) {
			pokeData.spriteUrl = resp.sprites.front_default;
			callback(pokeData);
		});
	});
}

function getDefaultForm(varieties) {
	for(let i = 0; i < varieties.length; i++) {
		if(varieties[i].is_default) {
			return varieties[i].pokemon;
		}
	}
}

function getNumFromUrl(url) {
	let rx = /(\d+)\/$/
	return rx.exec(url)[1];
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}