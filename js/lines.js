var bp = {};
bp.game = (function () {
	"use strict";

	function Lines() {
		this.sideSize = 9;
		this.totalFields = 81;
		this.fieldsPerTurn = 3;
		this.totalColors = 7;
		this.minLineLength = 5;
		this.score = 0;
		this.occupiedFields = [];
		this.occupiedFieldsCount = 0;
		this.nextColors = [this.fieldsPerTurn];
		this.source = null;
		this.path = null;
	}

	Lines.prototype = {
		newGame: function () {
			var i, j;
			for (i = 0; i < this.sideSize; i += 1) {
				this.occupiedFields[i] = [this.sideSize];
				for (j = 0; j < this.sideSize; j += 1) {
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
		isGameOver: function () {
			return this.occupiedFieldsCount >= this.totalFields;
		},
		getRandomColor: function () {
			var color = Math.floor(Math.random() * this.totalColors);
			return color;
		},
		getColor: function () {
			var color = this.nextColors[0];
			this.nextColors[0] = this.nextColors[1];
			this.nextColors[1] = this.nextColors[2];
			this.nextColors[2] = this.getRandomColor();
			return color;
		},
		getNextColors: function () {
			return this.nextColors;
		},
		newBall: function () {
			var i, j, ball, cnt = 0, rnd = Math.floor(Math.random() * (this.totalFields - this.occupiedFieldsCount));
			for (i = 0; i < this.sideSize; i += 1) {
				for (j = 0; j < this.sideSize; j += 1) {
					if (this.occupiedFields[i][j].color === null) {
						if (cnt >= rnd) {
							ball = {x: i, y: j, color: this.getColor()};
							this.occupiedFieldsCount += 1;
							this.occupiedFields[i][j].color = ball.color;
							return ball;
						}
						cnt += 1;
					}
				}
			}
			return;
		},
		fill: function () {
			var k, newFields = [];
			for (k = 0; k < this.fieldsPerTurn; k += 1) {
				if (this.occupiedFieldsCount < this.totalFields) {
					newFields[k] = this.newBall();
				}
			}
			return newFields;
		},
		setSource: function (newSource) {
			var res = false, ball = this.getBall(newSource);
			if (ball) {
				this.source = ball;
				res = true;
			}
			return res;
		},
		resetSource: function () {
			this.source = null;
		},
		getSource: function () {
			return this.source;
		},
		getBall: function (position) {
			var res = null;
			if (position.x >= 0 && position.x < this.sideSize && position.y >= 0 && position.y < this.sideSize && this.occupiedFields[position.x][position.y].color !== null) {
				res = {x: position.x, y: position.y, color: this.occupiedFields[position.x][position.y].color};
			}
			return res;
		},
		move: function (target) {
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
		mergeLines: function (a, b) {
			var i, j, found, res = null;
			if (a && b) {
				res = a;
				res.cnt = a.cnt + b.cnt - 1;
				for (i = 0; i < b.fields.length; i += 1) {
					found = false;
					for (j = 0; j < a.fields.length; j += 1) {
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
		getLine: function (target) {
			var horizontal, vertical, fwdDiagonal, bckDiagonal, res;
			horizontal = this.getLineHorizontal(target);
			vertical = this.getLineVertical(target);
			fwdDiagonal = this.getLineSlash(target);
			bckDiagonal = this.getLineBackslash(target);
			res = this.mergeLines(horizontal, vertical);
			res = this.mergeLines(res, fwdDiagonal);
			res = this.mergeLines(res, bckDiagonal);
			if (res && res.fields) {
				this.score += res.fields.length;
				this.clearFields(res.fields);
				this.occupiedFieldsCount -= res.fields.length;
			}
			return res;
		},
		getLineHorizontal: function (target) {
			var i, testBall, res, first = this.getBall(target);
			i = target.y;
			while (i > 0) {
				testBall = this.getBall({x: target.x, y: i - 1});
				if (testBall && testBall.color === first.color) {
					first = testBall;
				} else {
					break;
				}
				i -= 1;
			}
			res = {cnt: 1, fields: [first]};
			i = first.y + 1;
			while (this.getBall({x: target.x, y: i}) && this.getBall({x: target.x, y: i}).color === first.color) {
				res.cnt += 1;
				res.fields[res.fields.length] = this.getBall({x: target.x, y: i});
				i += 1;
			}
			if (res.cnt < this.minLineLength) {
				res = null;
			}
			return res;
		},
		getLineVertical: function (target) {
			var i, testBall, res, first = this.getBall(target);
			i = target.x;
			while (i > 0) {
				testBall = this.getBall({x: i - 1, y: target.y});
				if (testBall && testBall.color === first.color) {
					first = testBall;
				} else {
					break;
				}
				i -= 1;
			}
			res = {cnt: 1, fields: [first]};
			i = first.x + 1;
			while (this.getBall({x: i, y: target.y}) && this.getBall({x: i, y: target.y}).color === first.color) {
				res.cnt += 1;
				res.fields[res.fields.length] = this.getBall({x: i, y: target.y});
				i += 1;
			}
			if (res.cnt < this.minLineLength) {
				res = null;
			}
			return res;
		},
		getLineSlash: function (target) {
			var i, j, testBall, res, first = this.getBall(target);
			i = target.x;
			j = target.y;
			while (i < this.sideSize - 1 && j > 0) {
				testBall = this.getBall({x: i + 1, y: j - 1});
				if (testBall && testBall.color === first.color) {
					first = testBall;
				} else {
					break;
				}
				i += 1;
				j -= 1;
			}
			res = {cnt: 1, fields: [first]};
			i = first.x - 1;
			j = first.y + 1;
			while (this.getBall({x: i, y: j}) && this.getBall({x: i, y: j}).color === first.color) {
				res.cnt += 1;
				res.fields[res.fields.length] = this.getBall({x: i, y: j});
				i -= 1;
				j += 1;
			}
			if (res.cnt < this.minLineLength) {
				res = null;
			}
			return res;
		},
		getLineBackslash: function (target) {
			var i, j, testBall, res, first = this.getBall(target);
			i = target.x;
			j = target.y;
			while (i > 0 && j > 0) {
				testBall = this.getBall({x: i - 1, y: j - 1});
				if (testBall && testBall.color === first.color) {
					first = testBall;
				} else {
					break;
				}
				i -= 1;
				j -= 1;
			}
			res = {cnt: 1, fields: [first]};
			i = first.x + 1;
			j = first.y + 1;
			while (this.getBall({x: i, y: j}) && this.getBall({x: i, y: j}).color === first.color) {
				res.cnt += 1;
				res.fields[res.fields.length] = this.getBall({x: i, y: j});
				i += 1;
				j += 1;
			}
			if (res.cnt < this.minLineLength) {
				res = null;
			}
			return res;
		},
		clearFields: function (fields) {
			var i;
			for (i = 0; i < fields.length; i += 1) {
				this.occupiedFields[fields[i].x][fields[i].y].color = null;
			}
		},
		getScore: function () {
			return this.score * 2;
		},
		getPath: function () {
			return this.path;
		},
		dijkstra: {
			fieldDistance: 1,
			game: null,
			initialize: function (source) {
				var i, j;
				for (i = 0; i < this.game.sideSize; i += 1) {
					for (j = 0; j < this.game.sideSize; j += 1) {
						this.game.occupiedFields[i][j].distance = null;
						this.game.occupiedFields[i][j].previous = null;
						if (this.game.occupiedFields[i][j].color === null) {
							this.game.occupiedFields[i][j].visited = false;
						} else {
							this.game.occupiedFields[i][j].visited = true;
						}
						if (source.x === i && source.y === j) {
							this.game.occupiedFields[i][j].distance = 0;
							this.game.occupiedFields[i][j].visited = true;
						}
					}
				}
			},
			relax: function (prev, next, distance) {
				if (this.game.occupiedFields[next.x][next.y].distance === null || this.game.occupiedFields[next.x][next.y].distance > this.game.occupiedFields[prev.x][prev.y].distance + distance) {
					this.game.occupiedFields[next.x][next.y].distance = this.game.occupiedFields[prev.x][prev.y].distance + distance;
					this.game.occupiedFields[next.x][next.y].previous = {x: prev.x, y: prev.y};
				}
				return this.game.occupiedFields[next.x][next.y].distance;
			},
			compare: function (a, b) {
				var priority1, priority2;
				priority1 = bp.game.occupiedFields[a.x][a.y].distance;
				priority2 = bp.game.occupiedFields[b.x][b.y].distance;
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
			getAdjecent: function (source) {
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
			shortestPath: function (game, source, target) {
				this.game = game;
				var q, u, adjecent, i, path = [];
				this.initialize(source);
				q = [source];
				while (q.length > 0) {
					u = q.shift();
					if (u.x === target.x && u.y === target.y) {
						break;
					}
					adjecent = this.getAdjecent(u);
					for (i = 0; i < adjecent.length; i += 1) {
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

	return new Lines();
}());
