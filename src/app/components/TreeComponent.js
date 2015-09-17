// Add css to bundle
import './../../css/treeComponent.css';

import d3 from 'd3';
import _max from 'lodash/collection/max';

export default class TreeComponent {
	
	constructor(params) {
		this.options = params.options;
		this.root = null;
		this.container = params.container;
		
		this.svgContainer = null;
		this.svg = null;
		this.tree = null;
		this.diagonal = null;
		
		this.index = 0;
		
		this.setRoot(params.data);
		this._initContainer();
		this.updateTree(this.root, true);
	}
	
	setRoot(data) {
		this.root = data;
		this.root.x0 = this.options.height / 2;
		this.root.y0 = 0;
		
		return this.root;
	}
	
	
	/**
	 * Main drawer function
	 * Uses d3.js to draw the tree
	 * 
	 * @param {object} source    Source node (root node or event initiator)
	 * @param {bool}   animate   Is animation needed (default: false)
	 */
	updateTree(source, animate = false) {
		
		var {tree, root, svg, diagonal} = this;
		var {width, height, margin} = this.options;
		var animationTime = (animate) ? this.options.animationTime : 0;
		
		var nodes = tree.nodes(root);
		var links = tree.links(nodes);

	  	// Normalize for fixed-depth.
	  	nodes.forEach((d) => d.y = d.depth * 180);

	  	// Update nodes…
	  	var node = svg.selectAll("g.node")
			.data(nodes, (d) => d.id || (d.id = ++this.index));

	  	// Expand nodes from their parent. For growing effect in animation 
	  	var nodeEnter = node.enter().append("g")
			.attr("class", "node")
		  	.attr("transform", (d) => this._translatePosition(source.y0, source.x0))
		  	// Attach on click handler. It will collapse/expand subtrees on click
		  	.on("click", (d) => this._onNodeClick(d));
		  	
		// Init node's circle. Declare the minimum radius (for animation)
	  	nodeEnter.append("circle")
			.attr("r", TreeComponent.values.MINIMUM_THRESHOLD)
			.style("fill", (d) => this._styleNode(d));
			
		// Add node's title
	  	nodeEnter.append("text")
			.attr("x", (d) => {
				var distance = TreeComponent.values.DISTANCE;
				return d.children || d._children ? -distance : distance; 
			})
		  	.attr("dy", ".35em")
		  	.attr("text-anchor", (d) => d.children || d._children ? "end" : "start")
		  	.text((d) => d.name)
		  	.style("fill-opacity", TreeComponent.values.MINIMUM_THRESHOLD);

	  	// Navigate nodes to their new position.
	  	var nodeUpdate = node.transition()
			.duration(animationTime)
			.attr("transform", (d) => this._translatePosition(d.x, d.y));

	  	nodeUpdate.select("circle")
			.attr("r", TreeComponent.values.NODE_RADIUS)
		  	.style("fill", (d) => this._styleNode(d));

	  	nodeUpdate.select("text")
			.style("fill-opacity", 1);
		
		// Update exit nodes to the parent's new position.
	  	var nodeExit = node.exit().transition()
			.duration(animationTime)
			.attr("transform", (d) => this._translatePosition(source.x, source.y))
			.remove();

	  	nodeExit.select("circle")
		 	.attr("r", TreeComponent.values.MINIMUM_THRESHOLD);

	  	nodeExit.select("text")
			.style("fill-opacity", TreeComponent.values.MINIMUM_THRESHOLD);

	  	// Update links
	  	var link = svg.selectAll("path.link")
			.data(links, (d) => d.target.id);

	  	// Enter any new links at the parent's previous position.
	  	link.enter().insert("path", "g")
			.attr("class", "link")
			.attr("d", (d) => this._transitionLinks(source.x0, source.y0));

	  	// Update links to new position.
	  	link.transition()
			.duration(animationTime)
			.attr("d", diagonal);

	  	// Update exit nodes links to the parent's new position.
	  	link.exit().transition()
			.duration(animationTime)
			.attr("d", (d) => this._transitionLinks(source.x, source.y))
		  	.remove();

	  	// Store old values. For animation purposes
	  	nodes.forEach((d) => {
			d.x0 = d.x;
			d.y0 = d.y;
	  	});
	  	
	  	// Calculate the highest element height and resize container to fit its content
	  	var height = _max(nodes, "y").y;
	  	this._resizeContainer({ height: height });
	}
	
	_initContainer() {
		var {width, height, margin} = this.options;
		
		this.tree = d3.layout.tree()
			.size([height, width]);

		this.diagonal = d3.svg.diagonal()
			.projection((d) => [d.x, d.y]);

		this.svgContainer = d3.select(this.container).append("svg");
			
		this.svg = this.svgContainer.append("g")
			.attr("transform", this._translatePosition(margin.left, margin.top));
	}
	
	_resizeContainer(size) {
		
		var {width, height, margin} = this.options;
		
		var newWidth = size.width || width;
		var newHeight = size.height || height;
		
		this.svgContainer
			.attr("width", newWidth + margin.right + margin.left)
			.attr("height", newHeight + margin.top + margin.bottom);
	}
	
	_onNodeClick(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
	  	} else {
			d.children = d._children;
			d._children = null;
	  	}
	  	
	  	this.updateTree(d, true);
	}
	
	_styleNode(d) {
		return d._children ? "#449fdb" : "#fff";
	}
	
	_translatePosition(x, y) {
		return `translate(${x}, ${y})`;
	}
	
	_transitionLinks(x, y) {
		var o = {x: x, y: y};
		return this.diagonal({source: o, target: o});
	}
	
	static values = {
		NODE_RADIUS: 10,
		DISTANCE: 15,
		MINIMUM_THRESHOLD: 1e-6
	}
	
}