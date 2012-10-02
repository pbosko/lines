var game = {
	sideSize: 9,
	totalFields: 81,
	fieldsPerTurn: 3,
	totalColors: 7,
	minLineLength: 5,
	score: 0,
	occupiedFields: new Array(),
	occupiedFieldsCount: 0,
	nextColors: new Array(this.fieldsPerTurn),
	source: null,
	path: null,
	newGame: function() {
		for (var i = 0; i < this.sideSize; i ++) {
			this.occupiedFields[i] = new Array(this.sideSize);
			for (var j = 0; j < this.sideSize; j ++) {
				this.occupiedFields[i][j] = {
					color: null,
					distance: null
				};
			}
		}
		this.nextColors[0] = this.getRandomColor();
		this.nextColors[1] = this.getRandomColor();
		this.nextColors[2] = this.getRandomColor();
		this.score = 0;
		return this.fill();
	},
	isGameOver: function() {
		return this.occupiedFieldsCount >= this.totalFields;
	},
	getRandomColor: function() {
		var color = Math.floor(Math.random() * this.totalColors);
		return color;
	},
	getColor: function() {
		var color = this.nextColors[0];
		this.nextColors[0] = this.nextColors[1];
		this.nextColors[1] = this.nextColors[2];
		this.nextColors[2] = this.getRandomColor();
		return color;
	},
	getNextColors: function() {
		return this.nextColors;
	},
	newBall: function() {
		var rnd = Math.floor(Math.random() * (this.totalFields - this.occupiedFieldsCount));
		var cnt = 0;
		for (var i = 0; i < this.sideSize; i ++) {
			for (var j = 0; j < this.sideSize; j ++) {
				if (this.occupiedFields[i][j].color === null) {
					if (cnt >= rnd) {
						var ball = {x: i, y: j, color: this.getColor()};
						this.occupiedFieldsCount ++;
						this.occupiedFields[i][j].color = ball.color;
						return ball;
					}
					cnt ++;
				}
			}
		}
		return;
	},
	fill: function() {
		var newFields = new Array();
		for (var k = 0; k < this.fieldsPerTurn; k ++) {
			if (this.occupiedFieldsCount < this.totalFields) {
				newFields[k] = this.newBall();
			}
		}
		return newFields;
	},
	setSource: function(newSource) {
		var res = false;
		var ball = this.getBall(newSource);
		if (ball) {
			this.source = ball;
			res = true;
		}
		return res;
	},
	resetSource: function() {
		this.source = null;
	},
	getSource: function() {
		return this.source;
	},
	getBall: function(position) {
		var res = null;
		if (position.x >= 0 && position.x < this.sideSize && position.y >= 0 && position.y < this.sideSize && this.occupiedFields[position.x][position.y].color !== null) {
			res = {x: position.x, y: position.y, color: this.occupiedFields[position.x][position.y].color};
		}
		return res;
	},
	move: function(target) {
		var res = false;
		if (target.x >= 0 && target.x < this.sideSize && target.y >= 0 && target.y < this.sideSize) {
			if (this.source) {
				if (this.source.x !== target.x || this.source.y !== target.y) {
					this.path = this.dijkstra.shortestPath(this, this.source, target);
					if (this.path.length > 0) {
						this.occupiedFields[target.x][target.y].color = this.source.color;
						this.occupiedFields[this.source.x][this.source.y].color = null;
						this.resetSource();
						res = true;
					}
				}
			}
		}
		return res;
	},
	mergeLines: function(a, b) {
		var res = null;
		if (a && b) {
			res = a;
			res.cnt = a.cnt + b.cnt - 1;
			var found;
			for (var i = 0; i < b.fields.length; i ++) {
				found = false;
				for (var j = 0; j < a.fields.length; j ++) {
					if (b.fields[i].x === a.fields[j].x && b.fields[i].y === a.fields[j].y) {
						found = true;
						break;
					}
				}
				if (!found) {
					res.fields[res.fields.length] = b.fields[i];
				}
			}
		} else {
			res = a || b;
		}
		return res;
	},
	getLine: function(target) {
		var horizontal = this.getLineHorizontal(target);
		var vertical = this.getLineVertical(target);
		var fwdDiagonal = this.getLineSlash(target);
		var bckDiagonal = this.getLineBackslash(target);
		var res = this.mergeLines(horizontal, vertical);
		res = this.mergeLines(res, fwdDiagonal);
		res = this.mergeLines(res, bckDiagonal);
		if (res && res.fields) {
			this.score += res.fields.length;
			this.clearFields(res.fields);
			this.occupiedFieldsCount -= res.fields.length;
		}
		return res;
	},
	getLineHorizontal: function(target) {
		var first = this.getBall(target);
		var i = target.y;
		while (i > 0) {
			var testBall = this.getBall({x: target.x, y: i - 1});
			if (testBall && testBall.color === first.color) {
				first = testBall;
			} else {
				break;
			}
			i --;
		}
		var res = {cnt: 1, fields: [first]};
		i = first.y + 1;
		while (this.getBall({x: target.x, y: i}) && this.getBall({x: target.x, y: i}).color === first.color) {
			res.cnt ++;
			res.fields[res.fields.length] = this.getBall({x: target.x, y: i});
			i ++;
		}
		if (res.cnt < this.minLineLength) {
			res = null;
		}
		return res;
	},
	getLineVertical: function(target) {
		var first = this.getBall(target);
		var i = target.x;
		while (i > 0) {
			var testBall = this.getBall({x: i - 1, y: target.y});
			if (testBall && testBall.color === first.color) {
				first = testBall;
			} else {
				break;
			}
			i --;
		}
		var res = {cnt: 1, fields: [first]};
		i = first.x + 1;
		while (this.getBall({x: i, y: target.y}) && this.getBall({x: i, y: target.y}).color === first.color) {
			res.cnt ++;
			res.fields[res.fields.length] = this.getBall({x: i, y: target.y});
			i ++;
		}
		if (res.cnt < this.minLineLength) {
			res = null;
		}
		return res;
	},
	getLineSlash: function(target) {
		var first = this.getBall(target);
		var i = target.x;
		var j = target.y;
		while (i < this.sideSize - 1 && j > 0) {
			var testBall = this.getBall({x: i + 1, y: j - 1});
			if (testBall && testBall.color === first.color) {
				first = testBall;
			} else {
				break;
			}
			i ++;
			j --;
		}
		var res = {cnt: 1, fields: [first]};
		i = first.x - 1;
		j = first.y + 1;
		while (this.getBall({x: i, y: j}) && this.getBall({x: i, y: j}).color === first.color) {
			res.cnt ++;
			res.fields[res.fields.length] = this.getBall({x: i, y: j});
			i --;
			j ++;
		}
		if (res.cnt < this.minLineLength) {
			res = null;
		}
		return res;
	},
	getLineBackslash: function(target) {
		var first = this.getBall(target);
		var i = target.x;
		var j = target.y;
		while (i > 0 && j > 0) {
			var testBall = this.getBall({x: i - 1, y: j - 1});
			if (testBall && testBall.color === first.color) {
				first = testBall;
			} else {
				break;
			}
			i --;
			j --;
		}
		var res = {cnt: 1, fields: [first]};
		i = first.x + 1;
		j = first.y + 1;
		while (this.getBall({x: i, y: j}) && this.getBall({x: i, y: j}).color === first.color) {
			res.cnt ++;
			res.fields[res.fields.length] = this.getBall({x: i, y: j});
			i ++;
			j ++;
		}
		if (res.cnt < this.minLineLength) {
			res = null;
		}
		return res;
	},
	clearFields: function(fields) {
		for (var i = 0; i < fields.length; i ++) {
			this.occupiedFields[fields[i].x][fields[i].y].color = null;
		}
	},
	getScore: function() {
		return this.score * 2;
	},
	getPath: function() {
		return this.path;
	},
	dijkstra: {
		fieldDistance: 1,
		game: null,
		initialize: function(source) {
			for (var i = 0; i < this.game.sideSize; i ++) {
				for (var j = 0; j < this.game.sideSize; j ++) {
					this.game.occupiedFields[i][j].distance = null;
					this.game.occupiedFields[i][j].previous = null;
					if (this.game.occupiedFields[i][j].color === null) {
						this.game.occupiedFields[i][j].visited = false;
					} else {
						this.game.occupiedFields[i][j].visited = true;
					}
					if (source.x === i && source.y == j) {
						this.game.occupiedFields[i][j].distance = 0;
						this.game.occupiedFields[i][j].visited = true;
					}
				}
			}
		},
		relax: function(prev, next, distance) {
			if (this.game.occupiedFields[next.x][next.y].distance === null || this.game.occupiedFields[next.x][next.y].distance > this.game.occupiedFields[prev.x][prev.y].distance + distance) {
				this.game.occupiedFields[next.x][next.y].distance = this.game.occupiedFields[prev.x][prev.y].distance + distance;
				this.game.occupiedFields[next.x][next.y].previous = {x: prev.x, y: prev.y};
			}
			return this.game.occupiedFields[next.x][next.y].distance;
		},
		compare: function(a, b) {
			var priority1 = this.game.occupiedFields[a.x][a.y].distance;
			var priority2 = this.game.occupiedFields[b.x][b.y].distance;
			if (priority1 === priority2) {
				return 0;
			}
			if (priority1 === null) {
				return -1;
			}
			if (priority2 === null) {
				return 1;
			}
			return priority1 - priority2;
		},
		getAdjecent: function(source) {
			var res = [];
			if (source.x > 0 && !this.game.occupiedFields[source.x - 1][source.y].visited) {
				res.push({x: source.x - 1, y: source.y});
			}
			if (source.x < this.game.sideSize - 1 && !this.game.occupiedFields[source.x + 1][source.y].visited) {
				res.push({x: source.x + 1, y: source.y});
			}
			if (source.y > 0 && !this.game.occupiedFields[source.x][source.y - 1].visited) {
				res.push({x: source.x, y: source.y - 1});
			}
			if (source.y < this.game.sideSize - 1 && !this.game.occupiedFields[source.x][source.y + 1].visited) {
				res.push({x: source.x, y: source.y + 1});
			}
			return res;
		},
		shortestPath: function(game, source, target) {
			this.game = game;
			var q, u, adjecent, i, prevDistance, path = [];
			this.initialize(source);
			q = [source];
			while (q.length > 0) {
				u = q.shift();
				if (u.x === target.x && u.y === target.y) {
					break;
				}
				adjecent = this.getAdjecent(u);
				for (i = 0; i < adjecent.length; i ++) {
					if (game.occupiedFields[adjecent[i].x][adjecent[i].y].distance === null) {
						q.push(adjecent[i]);
					}
					this.relax(u, adjecent[i], this.fieldDistance);
				}
				q.sort(this.compare);
				game.occupiedFields[u.x][u.y].visited = true;
			}
			while (game.occupiedFields[target.x][target.y].distance > 0) {
				path.unshift(target);
				target = game.occupiedFields[target.x][target.y].previous;
			}
			return path;
		}
	}
};