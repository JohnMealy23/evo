//DOM could be the world, in which obstacles get placed.  
//Proximity to obstical means reduced stats and behavior change

var evo = function() {
	"use strict";
	var evo = this;
	evo.config = {
		buryTheDead: true
	};
	evo.dna = function(parentDna) {
		var genome = parentDna,
			evolved = false,
			mutate = evo.mutate,
			key;
		for(key in genome) genome[key] = mutate(genome[key]);
		// for(key in genome) genome[key] = mutate[key](genome[key]);
		return genome;
	};
	evo.log = function(message1, message2, message3) {
		if(message3) return console.log(message1, message2, message3);
		if(message2) return console.log(message1, message2);
		return console.log(message1);
	};
	evo.getName = getName;
	evo.currentName = -1;
	function getName() {
		evo.currentName++;
		return evo.currentName;
	};
	evo.surnames = ['mealy','pecko','hart','taddeo','maister','buttacy','hunt'];
	evo.habitat = {};
	evo.dnaRecord = {};
	evo.speciesRecord = {};
	evo.lifeProcesses = {
		// name: evo.getName(),
		// lineage: lineage,
		// age: 0,
		// fed: false,
		// fatal: false,
		// parent: 0,
		// children: 0,
		// speciesCode: "",
		// surname: evo.surnames.shift(),
		// init: {}
		eat: function(dna, stats) {
			// if(stats.init.eat !== true) {
				// stats.fed += stats.init.eat;
				// statis.init.eat = true;
			// }
			stats.fed += 1;
			return stats;
		},
		breed: function(dna, stats) {
			var name = stats.name;
			evo.dnaRecord[name] = dna; 
			evo.habitat[name] = new evo.organism(dna,stats.lineage);
			evo.domBirth(stats);
			stats.parent += 1;
			return stats;
		},
		grow: function(dna, stats) {
			stats.size += dna.grow.rate;
			return stats;
		},
		age: function(dna, stats) {
			// if(stat.init !== true) {
				// for(key in stat.init) {
					// stat[key].init;
				// }
			// }
			if(dna.age.max === stats.age) stats.fatal = "age";
			else if(dna.eat.min > stats.fed) stats.fatal = "eat";
			stats.age++;
			stats.fed = 0;
			return stats;
		}
	};
	evo.defaultDna = {
		eat: {
			frequency: 150,
			process: [evo.lifeProcesses.eat],
			rate: 1,
			min: 10, // Minimum required food for a given cycle
			max: 100,
			init: 10
		},
		breed: {
			frequency: 6000,
			process: [evo.lifeProcesses.breed],
			rate: 1,
			min: 0, // Minimum required food for a given cycle
			max: 1000000,
			init: 10
		},
		grow: {
			frequency: 1500,
			process: [evo.lifeProcesses.grow],
			rate: 1,
			min: 0,
			max: 100,
			init: 10
		},
		age: {
			frequency: 5000,
			process: [evo.lifeProcesses.age],
			rate: 1,
			min: 0,
			max: 10, // Lifespan in number of cycles
			init: 10
		}
	};
	evo.mutate = function(dnaComponent) {
	// Increase the odds for bad mutation over good. Perhaps create stomach = {} which only has ports for 3,5,8. mutations that hit those ports help, and those that don't, hurt. 
	// It would be OK to duplicate traits, instead of adjusting values
	// Another thought is to only increase one dnaComponent if another is being decreased, and vice versa 
		var theOdds = {
				onePercent: function() {
					//1:100
					var rando = Math.floor(Math.random() * (100 - 1)) + 1;
					if(rando !== 42) return false;
					return true; 
				},
				twoToOne: function() {
					//1:1000 a change will happen; 2:3 that will be negative
					var dice = Math.floor((Math.random() * 3000)); // 0 - 2999
					if(dice > 2) return 0;
					if(dice === 0) return 1; 
					return -1;
				},
				coinFlip: function() {}
			},
			dice = theOdds.twoToOne();
		
		if(dice === 0) {}
		else if((dice < 0) && dnaComponent.frequency !== 0) dnaComponent.frequency -= dnaComponent.frequency * 1.3;
		else dnaComponent.frequency += dnaComponent.frequency * 1.3; //Dice was a 
		dice = theOdds.twoToOne();
		if(dice === 0) return dnaComponent;
		else if((dice > 0) && dnaComponent.process.length !== 0) delete dnaComponent.process[dnaComponent.process.length - 1];
		else dnaComponent.process.push(dnaComponent.process[0]);
		return dnaComponent;
	};
	evo.organism = function(parentDna, lineage) {
		var dna = new evo.dna(parentDna),
			stats = {
				name: evo.getName(),
				lineage: lineage,
				age: 0,
				fed: dna.eat.init,
				fatal: false,
				parent: 0,
				children: 0,
				speciesCode: "",
				surname: evo.surnames.shift(),
				init: {}
			},
			lifeCycle = [],
			i,
			key;
		for(key in dna) {
			stats.speciesCode += key + "_" + dna[key].process.length + "-" + dna[key].frequency + "|";
			stats.init[key] = dna[key].init;
		};
		stats.lineage[stats.name] = stats.surname;
		for(a=0;a < dna.age.process.length;a) {
			lifeCycle.push(setInterval(function() {
				if(stats.fatal) {
					for(x=0;x < lifeCycle.length;x++) {
						clearInterval(lifeCycle[x]);
						evo.log(stats.name + " died of " + stats.fatal, dna);
						if(evo.config.buryTheDead) ;//remove from obj
					}
				} else {
					stats = dna.age.process(dna, stats);
					evo.log("Organism-" + stats.surname + ". stats:", stats, 'after age');
				}
			}, dna.age.frequency));	
			a++;	
		}
		for(b=0;b < dna.breed.process.length;b) {
			lifeCycle.push(setInterval(function() {
				if(stats.fatal) {
					for(x=0;x < lifeCycle.length;x++) {
						clearInterval(lifeCycle[x]);
						evo.log(stats.name + " died of " + stats.fatal, dna);
						if(evo.config.buryTheDead) ;//remove from obj
					}
				} else {
					stats = dna.breed.process(dna, stats);
					evo.log("Organism-" + stats.surname + ". stats:", stats, 'after breed');
				}
			}, dna.breed.frequency));	
			b++;	
		}
		for(c=0;c < dna.eat.process.length;c) {
			lifeCycle.push(setInterval(function() {
				if(stats.fatal) {
					for(x=0;x < lifeCycle.length;x++) {
						clearInterval(lifeCycle[x]);
						evo.log(stats.name + " died of " + stats.fatal, dna);
						if(evo.config.buryTheDead) ;//remove from obj
					}
				} else {
					stats = dna.eat.process(dna, stats);
					evo.log("Organism-" + stats.surname + ". stats:", stats, 'after eat');
				}
			}, dna.eat.frequency));	
			c++;	
		}
		for(d=0;d < dna.grow.process.length;d) {
			lifeCycle.push(setInterval(function() {
				if(stats.fatal) {
					for(x=0;x < lifeCycle.length;x++) {
						clearInterval(lifeCycle[x]);
						evo.log(stats.name + " died of " + stats.fatal, dna);
						if(evo.config.buryTheDead) ;//remove from obj
					}
				} else {
					stats = dna.grow.process(dna, stats);
					evo.log("Organism-" + stats.surname + ". stats:", stats, 'after grow');
				}
			}, dna.grow.frequency));	
			d++;	
		}
		if(!evo.speciesRecord[stats.speciesCode]) evo.speciesRecord[stats.speciesCode] = [stats.name];
		else evo.speciesRecord[stats.speciesCode].push(stats.name);
	};
	evo.domBirth = function(stats) {
		if(!evo.evolutionInit) evo.initializeDom();
		var habitatElem = document.getElementById("evoHabitat"), //
			sectionId = "section_" + stats.surname,
			sectionElem = document.getElementById(sectionId) || createElem(sectionId, habitatElem, 'evo_section'),
			graphId = "graph_" + stats.speciesCode,
			graphElem = document.getElementById(graphId) || createElem(graphId, sectionElem, 'evo_graph'),
			organismId = "organism_" + stats.name,
			organismElem = {};
		function createElem(elemId, parent, elemClass) {
			var elem = document.createElement('div');
			elem.id = elemId;
			if(elemClass) elem.class = elemClass;
			parent.appendChild(elem);
			return elem;
		}
		organismElem = createElem(organismId, graphElem, 'evo_organism'); 
	};
	evo.initializeDom = function() {
		var graphElem = document.createElement('div');
		var habitatElem = document.createElement('div');
		graphElem.id = "evoGraphs";
		habitatElem.id = "evoHabitat";
		// elem.style.cssText = 'position:absolute;width:100%;height:100%;opacity:0.3;z-index:100;background:#000;';
		document.body.appendChild(graphElem);
		document.body.appendChild(habitatElem);
		evo.evolutionInit = true;
	};
	evo.evolutionInit = false;
	return evo;
};

function immaculateConception() {
	var mary = window.evo.defaultDna,
		joseph = {
			name: window.evo.getName(),
			lineage: [],
			age: 0,
			fed: false,
			fatal: false,
			children: 0,
			speciesCode: "",
			surname: window.evo.surnames.shift(),
			init: {}
		};
	for(key in mary) {
		for(prop in mary[key]) {
			if(prop !== "process") {
				mary[key][prop] = document.getElementById("evo" + key + prop).value || mary[key][prop];
			}
		}
		joseph.init[key] = mary[key].init;
		joseph.speciesCode += key + "_" + mary[key].process.length + "-" + mary[key].frequency + "|";
	}
	joseph.lineage[joseph.name] = joseph.surname;
	window.evo.lifeProcesses.breed(mary, joseph);	
}

window.onload = function() {
	var inputContainer = document.getElementById('inputContainer'),
		inputString = "";
	for(key in window.evo.defaultDna) {
		inputString += "<div class='evoSettings' style='float:left; border:1px solid black; margin: 3px; padding: 3px;'><h2>" + key + "</h2><table>";
		for(prop in window.evo.defaultDna[key]) {
			if(prop !== "process") {
				inputString += "<tr><td><label for='evo" + key + prop + "'>" + prop + ": </label></td>";
				inputString += "<td><input id='evo" + key + prop + "' type='text' class='evoInput' value='" + window.evo.defaultDna[key][prop] + "'></td></tr>";
			}
		}
		inputString += "</table></div>";
	}
	inputContainer.innerHTML = inputString;
};
window.evo = new evo();
// Each organism in the DOM is composed of a pixel for each DNA attrbute.  
// As those attributes speed up, the pixels reflect by turning from blue to red
// This should give a good picture of how quickly 
