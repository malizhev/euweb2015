export default class TreeNode {

	constructor(data) {
		this.name = data.name;
		this.children = [];
		this.left = data.left;
		this.right = data.right;
	}

	addChild(item) {
		this.children.push(item);
	}

}