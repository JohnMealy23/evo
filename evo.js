//DOM could be the world, in which obstacles get placed.  
//Proximity to obstical means reduced stats and behavior change
var currentName = -1,
	surnames = ['mealy','pecko','hart','taddeo','maister','buttacy','hunt'],
	lifeCycle = [],
	i, x;
function getName() {
	currentName++;
	return currentName;
};
function armageddon() {
	for(i=1;i<lifeCycle.length;i++) {
		for(x=0;x<lifeCycle[i].length;x++) {
			clearInterval(lifeCycle[i][x]);
		}
	}
	console.log("habitat: ",evo.habitat);
	console.log("dnaRecord: ",evo.dnaRecord);
	console.log("speciesRecord: ",evo.speciesRecord);
}
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
	evo.log = function(message1, message2, message3,message4) {
		if(message4) return console.log(message1, message2, message3, message4);
		if(message3) return console.log(message1, message2, message3);
		if(message2) return console.log(message1, message2);
		return console.log(message1);
	};
	evo.habitat = {};
	evo.dnaRecord = {};
	evo.speciesRecord = {};
	evo.lifeProcesses = {
		eat: function(dna, stats) {
			stats.fed += parseFloat(dna.eat.rate);
			return stats;
		},
		breed: function(dna, stats) {
			var name = getName();
			evo.dnaRecord[name] = dna; 
			evo.habitat[name] = new evo.organism(dna,stats,name);
			stats.children += 1;
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
			if(stats.age >= dna.age.max) stats.fatal = "age";
			else if(dna.eat.min > stats.fed) stats.fatal = "eat";
			stats.age++;
			stats.fed = 0;
			return stats;
		}
	};
	evo.defaultDna = {
		eat: {
			frequency: 450,
			process: [evo.lifeProcesses.eat],
			rate: 1,
			min: 10, // Minimum required food for a given cycle
			max: 100,
			init: 10,
			name: 'eat'
		},
		breed: {
			frequency: 3000,
			process: [evo.lifeProcesses.breed],
			rate: 1,
			min: 0, // Minimum required food for a given cycle
			max: 1000000,
			init: 0,
			name: 'breed'
		},
		grow: {
			frequency: 5000,
			process: [evo.lifeProcesses.grow],
			rate: 1,
			min: 0,
			max: 100,
			init: 0,
			name: 'grow'
		},
		age: {
			frequency: 4000,
			process: [evo.lifeProcesses.age],
			rate: 1,
			min: 0,
			max: 5, // Lifespan in number of cycles
			init: 0,
			name: 'age'
		}
	};
	evo.defaultStats ={
		name: getName(),
		lineage: [],
		age: 0,
		fed: false,
		fatal: false,
		children: 0,
		speciesCode: "",
		surname: surnames.shift(),
		init: {}
	};
	evo.mutate = function(dnaComponent) {
	// Increase the odds for bad mutation over good. Perhaps create stomach = {} which only has ports for 3,5,8. mutations that hit those ports help, and those that don't, hurt. 
	// It would be OK to duplicate traits, instead of adjusting values
	// Another thought is to only increase one dnaComponent if another is being decreased, and vice versa 
		dnaComponent.frequency = parseFloat(dnaComponent.frequency);
		var mutationRate = document.getElementById("mutationRate").value || 300, 
			theOdds = {
				onePercent: function() {
					//1:100
					var rando = Math.floor(Math.random() * (100 - 1)) + 1;
					if(rando !== 42) return false;
					return true; 
				},
				twoToOne: function() {
					//1:1000 a change will happen; 2:3 that will be negative
					var dice = Math.floor((Math.random() * mutationRate));
					if(dice > 2) return 0;
					if(dice === 0) return 1; 
					return -1;
				},
				coinFlip: function() {}
			},
			dice = theOdds.twoToOne();
		
		if(dice === 0) {}
		else if((dice < 0) && dnaComponent.frequency !== 0) {
			dnaComponent.frequency -= dnaComponent.frequency/3;
			if(dnaComponent.frequency < 0) dnaComponent.frequency = 0;
			console.log(dnaComponent, "Frequency increased: " + dnaComponent.name);
		}
		else {
			dnaComponent.frequency += parseFloat(dnaComponent.frequency) * 1.3; //
			console.log(dnaComponent, "Frequency decreased: " + dnaComponent.name);
		}
		// dice = theOdds.twoToOne();
		// if(dice === 0) return dnaComponent;
		// else if((dice > 0) && dnaComponent.process.length !== 0) delete dnaComponent.process[dnaComponent.process.length - 1];
		// else dnaComponent.process.push(dnaComponent.process[0]);
		return dnaComponent;
	};
	evo.organism = function(parentDna, parentStats, name) {
		
		var dna = new evo.dna(parentDna),
			stats = {
				name: name,
				lineage: parentStats.lineage.slice(0),
				age: 0,
				fed: parseFloat(dna.eat.init),
				fatal: false,
				children: 0,
				speciesCode: "",
				surname: parentStats.lineage[parentStats.lineage.length-1],
				init: {}
			},
			i, a, b, c, d, x,
			key;
		lifeCycle[stats.name] = [];
		for(key in dna) {
			stats.speciesCode += key + "_" + dna[key].process.length + "-" + dna[key].frequency + "|";
			stats.init[key] = dna[key].init;
		};
		stats.lineage[stats.name] = stats.surname;
		evo.domBirth(stats);
		function killIt(stats, processType) {
			var domOrg = document.getElementById("organism_" + stats.name);
			domOrg.style.backgroundColor = 'blue';
			for(x=0;x < lifeCycle[stats.name].length;x++) {
				clearInterval(lifeCycle[stats.name][x]);
				evo.log(stats.name + " died of " + stats.fatal + " during " + processType, dna);
				if(evo.config.buryTheDead) ;//remove from obj
			}
		} 
		
		for(a=0;a < dna.age.process.length;a) {
			lifeCycle[stats.name].push(setInterval(function() {
				if(stats.fatal) killIt(stats, 'age'); 
				else {
					evo.log("Organism-" + stats.name + ". stats:", stats, dna, ' after age');
					if(dna.age.process[0]) stats = dna.age.process[0](dna, stats);
					else stats.fatal = "age";
				}
			}, dna.age.frequency));	
			a++;	
		}
		for(b=0;b < dna.breed.process.length;b) {
			lifeCycle[stats.name].push(setInterval(function() {
				if(stats.fatal) killIt(stats, 'breed'); 
				else {
					if(dna.breed.process[0]) stats = dna.breed.process[0](dna, stats);
					evo.log("Organism-" + stats.name, ' after breed');
				}
			}, dna.breed.frequency));	
			b++;	
		}
		for(c=0;c < dna.eat.process.length;c) {
			lifeCycle[stats.name].push(setInterval(function() {
				if(stats.fatal) killIt(stats, 'eat'); 
				else {
					if(dna.eat.process[0]) stats = dna.eat.process[0](dna, stats);
					// evo.log("Organism-" + stats.name + ' after eat');
				}
			}, dna.eat.frequency));	
			c++;	
		}
		for(d=0;d < dna.grow.process.length;d) {
			lifeCycle[stats.name].push(setInterval(function() {
				if(stats.fatal) killIt(stats, 'grow'); 
				else {
					if(dna.grow.process[0]) stats = dna.grow.process[0](dna, stats);
					evo.log("Organism-" + stats.name + ' after grow');
				}
			}, dna.grow.frequency));	
			d++;	
		}
		if(!evo.speciesRecord[stats.speciesCode]) evo.speciesRecord[stats.speciesCode] = [stats.name];
		else evo.speciesRecord[stats.speciesCode].push(stats.name);
	};
	evo.domBirth = function(stats) {
		if(!evo.evolutionInit) evo.initializeDom();
		var habitatElem = document.getElementById("evoGraphs"), //
			sectionId = "section_" + stats.surname,
			sectionElem = document.getElementById(sectionId) || createElem(sectionId, habitatElem, 'evo_section'),
			graphId = "graph_" + stats.speciesCode,
			graphElem = document.getElementById(graphId),
			organismId = "organism_" + stats.name,
			organismElem = {};
		graphElem = graphElem || createElem(graphId, sectionElem, 'evo_graph', stats.speciesCode);
		function createElem(elemId, parent, elemClass, elemTitle) {
			var elem = document.createElement('div');
			elem.id = elemId;
			if(elemClass) elem.className = elemClass;
			if(elemTitle) elem.title = elemTitle;
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
		joseph = window.evo.defaultStats;
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
