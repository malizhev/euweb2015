// Add global css to bundle
import "./../css/app.css";

import JSON from 'json5';

import Tree from './classes/Tree';
import TreeComponent from './components/TreeComponent';

var defaultData = [
	{ name: "Cars", left: 1, right: 18 },
	{ name: "Fast", left: 2, right: 11 },
	{ name: "Red", left: 3, right: 6 },
	{ name: "Ferrari", left: 4, right: 5 },
	{ name: "Yellow", left: 7, right: 10 },
	{ name: "Lamborghini", left: 8, right: 9 },
	{ name: "Slow", left: 12, right: 17 },
	{ name: "Lada", left: 13, right: 14 },
	{ name: "Polonez", left: 15, right: 16 }
];

var dataInputElement = document.getElementById("app-input");
var inputErrorElement = document.getElementById("app-errors");

// Fill textarea with default data
dataInputElement.value = JSON.stringify(defaultData, null, 4);

// Create new tree
var treeData = new Tree(defaultData);

// Init tree component - graph drawn by d3.js
var treeComponent = new TreeComponent({
	data: treeData.getRootNode(),
	container: "#app-tree",
	options: {
		width: 700,
		height: 500,
		margin: {
			top: 20, 
			right: 120, 
			bottom: 20, 
			left: 120
		},
		animationTime: 300
	}
});

dataInputElement.addEventListener("input", onDataChanged);

function onDataChanged(e) {
	var rawData = e.target.value;
	var data, processedData;

	try {
		data = JSON.parse(rawData);
	} catch(ex) {
		return onDataInputError();
	}

	try {
		processedData = new Tree(data);
	} catch(ex) {
		return onDataInputError(ex);
	}
	
	var root = treeComponent.setRoot(processedData.getRootNode());
	treeComponent.updateTree(root);

	clearDataInputError();
}


function onDataInputError(err) {
	// If no error was provided - show default one
	inputErrorElement.innerHTML = (err) ? 
		err.toString() : 
		"Input data is invalid";
	inputErrorElement.classList.add("has-error");
}

function clearDataInputError() {
	inputErrorElement.innerHTML = null;
	inputErrorElement.classList.remove("has-error");
}