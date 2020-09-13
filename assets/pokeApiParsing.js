const pokeApiBaseUrl = "https://pokeapi.co/api/v2/";
let PokeApi = {
	loadGens: function(callback) {
		$.get(pokeApiBaseUrl + "generation", function(response) {
			var generations = [];
			for (let i = 0; i < response.results.length; i++) {
				const generation = response.results[i];
				
				let genNum = PokeApi.getNumFromUrl(generation.url);
				let splitName = response.results[i].name.split("-");
				
				let genName = PokeApi.capitalizeFirstLetter(splitName[0]) + " " + splitName[1].toUpperCase()
				generations.push({
					genNum: genNum,
					genName: genName
				});
			}
			
			callback(generations);
		});
	},
	
	loadPokemonFromGens: function(genNums, callback) {
		let receivedGens = 0;
		let totalPoke = 0;
		let receivedPoke = 0;
		let obtainedPokemon = {};
		
		for(let i = 0; i < genNums.length; i++) {
			$.get(pokeApiBaseUrl + "generation/" + genNums[i] + "/", function(response) {
				totalPoke += response.pokemon_species.length;
				receivedGens++;
				for(let j = 0; j < response.pokemon_species.length; j++) {
					PokeApi.getPokemonDetails(response.pokemon_species[j].url, function(pokeData){
						obtainedPokemon[pokeData.id] = pokeData;
						receivedPoke++;
						if(receivedGens === genNums.length
							&& receivedPoke === totalPoke
						) {
							PokeApi.linkEvolutionChains(obtainedPokemon);
							callback(obtainedPokemon);
						}
					});
				}
			});
		}
	},
	
	getPokemonDetails: function(url, callback) {
		var pokeData = {};
		$.get(url, function(response) {
			pokeData.id = response.id;
			pokeData.name = PokeApi.capitalizeFirstLetter(response.name);
			if(response.evolves_from_species) {
				//Not base mon
				//get id num of previous form
				pokeData.evolvesFromId = PokeApi.getNumFromUrl(response.evolves_from_species.url);
			}
			$.get(PokeApi.getDefaultForm(response.varieties).url, function(resp) {
				pokeData.spriteUrl = resp.sprites.front_default;
				callback(pokeData);
			});
		});
	},
	
	getDefaultForm: function(varieties) {
		for(let i = 0; i < varieties.length; i++) {
			if(varieties[i].is_default) {
				return varieties[i].pokemon;
			}
		}
	},
	
	getNumFromUrl: function(url) {
		let rx = /(\d+)\/$/
		return rx.exec(url)[1];
	},
	
	capitalizeFirstLetter: function(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	
	linkEvolutionChains: function(pokeList) {
		for (const key in pokeList) {
			if (pokeList.hasOwnProperty(key)) {
				let poke = pokeList[key];
				if(PokeApi.previousPokePresent(pokeList, poke)) {
					let basePoke = pokeList[poke.evolvesFromId];
					PokeApi.linkEvolutionChain(pokeList, poke, basePoke, 1);
				}
				else {
					poke.basePokeId = poke.id;
				}
			}
		}
	},
	
	linkEvolutionChain: function(pokeList, poke, basePoke, evLevel) {
		if(!basePoke.hasOwnProperty("evolvesToIds")) {
			basePoke.evolvesToIds = {};
		}
		if(!basePoke.evolvesToIds.hasOwnProperty(evLevel)) {
			basePoke.evolvesToIds[evLevel] = [];
		}
		basePoke.evolvesToIds[evLevel].push(poke.id);
		
		if(PokeApi.previousPokePresent(pokeList, basePoke)) {
			let nextBasePoke = pokeList[basePoke.evolvesFromId];
			PokeApi.linkEvolutionChain(pokeList, poke, nextBasePoke, evLevel + 1);
		}
		else {
			poke.basePokeId = basePoke.id;
		}
	},
	
	previousPokePresent: function(pokeList, poke) {
		return poke.hasOwnProperty("evolvesFromId")
			&& pokeList.hasOwnProperty(poke.evolvesFromId);
	}
}