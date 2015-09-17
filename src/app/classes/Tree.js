import _forEach from 'lodash/collection/forEach';
import _sortBy from 'lodash/collection/sortBy';
import _filter from 'lodash/collection/filter';

import TreeNode from './TreeNode';

export default class Tree {

	constructor(data, type) {
		this.type = type || Tree.STORING_METHODS.preorderTreeTraversal;
		this.tree = this._process(data);
	}

	getRootNode() {
		return this.tree[0];
	}

	_process(data) {
		// Run specific inverted traverse depending on tree storing method
		switch (this.type) {
			
			case Tree.STORING_METHODS.preorderTreeTraversal:
				return this._processTraversalMethod(data);
				break;
		}
	}


	/**
	 * Transforms initial data (preorder tree traversal) to format required by tree drawer (d3.js)
	 * Initial data example:
	 *
	 * [
     * 	{ name: "Cars", left: 1, right: 18 },
	 * 	{ name: "Fast", left: 2, right: 11 },
	 * 	...........
	 * 	{ name: "Polonez", left: 15, right: 16 }
	 * ]
	 * 
	 * Result format:
	 *
	 * [
		{
			"name": "Cars",
		    "children": [
		      	{
		        	"name": "Fast",
		        	"children": [
		          		.....
		        	]
		      	}
		    ]
		]
	 * 
	 * @param  {object} data 	Initial data
	 * @return {object}      	Result data
	 */
	_processTraversalMethod(data) {
		var ordered = _sortBy(data, "left");
		
		if (!ordered || !ordered.length) {
			throw new Error("Input data is invalid");
		}
		
		if (ordered[0] && ordered[0].left !== 1) {
			throw new Error("Root node not found!");
		}

		var rootNode = new TreeNode(ordered[0]);

		// Remove root element from the list. It's unnecessary now
		ordered.shift();

		var processSubtree = function(root) {

			var children = _filter(ordered, (node, i) => {
				
				if (!node) {
					return false;
				}
				
				// Check for node's DIRECT children
				var matches = 
					node.left - 1 === root.left || 
					node.right + 1 === root.right;
				
				// Remove element from the array to simplify further lookup
				if (matches) {
					ordered.splice(i, 1);
				}
				
				return matches;
			});
			
			// Recursively continue lookup in child nodes
			_forEach(children, (item) => {
				// Create new node instance
				var child = new TreeNode(item);
				
				// IMPORTANT. Add current node to parent's node.
				root.addChild(child);
				// Continue...
				processSubtree(child);
			});
			
		};
		
		// Launch subtree lookup from the root node
		processSubtree(rootNode);

		return [rootNode];
	}

	static STORING_METHODS = {
		preorderTreeTraversal: "PREORDER_TREE_TRAVERSAL"
	}

}