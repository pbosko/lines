var game = {
	sideSize: 9,
	totalFields: 81,
	fieldsPerTurn: 3,
	totalColors: 7,
	minLineLength: 5,
	score: 0,
	occupiedFields: new Array(),
	occupiedFieldsCount: 0,
	nextColors: new Array(3),
	source: null,
	newGame: function() {
		for (var i = 0; i < this.sideSize; i ++) {
			this.occupiedFields[i] = new Array(10);
			for (var j = 0; j < this.sideSize; j ++) {
				this.occupiedFields[i][j] = null;
			}
		}
		this.nextColors[0] = this.getRandomColor();
		this.nextColors[1] = this.getRandomColor();
		this.nextColors[2] = this.getRandomColor();
		this.score = 0;
		return this.fill();
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
	newBall: function() {
		var rnd = Math.floor(Math.random() * (this.totalFields - this.occupiedFieldsCount));
		var cnt = 0;
		for (var i = 0; i < this.sideSize; i ++) {
			for (var j = 0; j < this.sideSize; j ++) {
				if (this.occupiedFields[i][j] === null) {
					if (cnt >= rnd) {
						var ball = {x: i, y: j, color: this.getColor()};
						this.occupiedFieldsCount ++;
						this.occupiedFields[i][j] = ball.color;
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
	setSource: function(i, j) {
		var res = false;
		var ball = this.getBall(i, j);
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
	getBall: function(i, j) {
		var res = null;
		if (i >= 0 && i < this.sideSize && j >= 0 && j < this.sideSize && this.occupiedFields[i][j] !== null) {
			res = {x: i, y: j, color: this.occupiedFields[i][j]};
		}
		return res;
	},
	move: function(i, j) {
		var res = false;
		if (i >= 0 && i < this.sideSize && j >= 0 && j < this.sideSize) {
			if (this.source) {
				if (this.source.x !== i || this.source.y !== j) {
					if (this.occupiedFields[i][j] === null) {
						this.occupiedFields[i][j] = this.source.color;
						this.occupiedFields[this.source.x][this.source.y] = null;
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
		// TODO: Check all possible lines
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
		var first = this.getBall(target.x, target.y);
		var i = target.y;
		while (i > 0) {
			var testBall = this.getBall(target.x, i - 1);
			if (testBall && testBall.color === first.color) {
				first = testBall;
			} else {
				break;
			}
			i --;
		}
		var res = {cnt: 1, fields: [first]};
		i = first.y + 1;
		while (this.getBall(target.x, i) && this.getBall(target.x, i).color === first.color) {
			res.cnt ++;
			res.fields[res.fields.length] = this.getBall(target.x, i);
			i ++;
		}
		if (res.cnt < this.minLineLength) {
			res = null;
		}
		return res;
	},
	getLineVertical: function(target) {
		var first = this.getBall(target.x, target.y);
		var i = target.x;
		while (i > 0) {
			var testBall = this.getBall(i - 1, target.y);
			if (testBall && testBall.color === first.color) {
				first = testBall;
			} else {
				break;
			}
			i --;
		}
		var res = {cnt: 1, fields: [first]};
		i = first.x + 1;
		while (this.getBall(i, target.y) && this.getBall(i, target.y).color === first.color) {
			res.cnt ++;
			res.fields[res.fields.length] = this.getBall(i, target.y);
			i ++;
		}
		if (res.cnt < this.minLineLength) {
			res = null;
		}
		return res;
	},
	getLineSlash: function(target) {
		var first = this.getBall(target.x, target.y);
		var i = target.x;
		var j = target.y;
		while (i < this.sideSize - 1 && j > 0) {
			var testBall = this.getBall(i + 1, j - 1);
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
		while (this.getBall(i, j) && this.getBall(i, j).color === first.color) {
			res.cnt ++;
			res.fields[res.fields.length] = this.getBall(i, j);
			i --;
			j ++;
		}
		if (res.cnt < this.minLineLength) {
			res = null;
		}
		return res;
	},
	getLineBackslash: function(target) {
		var first = this.getBall(target.x, target.y);
		var i = target.x;
		var j = target.y;
		while (i > 0 && j > 0) {
			var testBall = this.getBall(i - 1, j - 1);
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
		while (this.getBall(i, j) && this.getBall(i, j).color === first.color) {
			res.cnt ++;
			res.fields[res.fields.length] = this.getBall(i, j);
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
			this.occupiedFields[fields[i].x][fields[i].y] = null;
		}
	},
	getScore: function() {
		return this.score * 2;
	}
};

var ui = {
	sideSize: 9,
	createTable: function() {
		var table = $('#table');
		for (var i = 0; i < this.sideSize; i ++) {
			for (var j = 0; j < this.sideSize; j ++) {
				$('<div id="field_' + i + '_' + j + '"></div>').appendTo(table);
				$('#field_' + i + '_' + j).click(this.fieldClicked);
			}
		}
	},
	fillIn: function(newFields) {
		for (var i = 0; i < newFields.length; i ++) {
			$('#field_' + newFields[i].x + '_' + newFields[i].y).removeClass().addClass('color' + newFields[i].color);
		}
		// TODO: for each new ball it should be checked if line is filled, after all new balls are placed
	},
	fieldClicked: function(event) {
		var field = $(this);
		var idArr = field.attr('id').split('_');
		var x = parseInt(idArr[1], 10);
		var y = parseInt(idArr[2], 10);
		var source = game.getSource();
		var target = {x: x, y: y};
		if (source) {
			if (source.x === x && source.y === y) {
				/* target same as source: reset source */
				field.removeClass().addClass('color' + source.color); // X2
				game.resetSource(); // X2
			} else if (game.getBall(x, y)) {
				/* target occupied: target becomes new source */
				$('#field_' + source.x + '_' + source.y).removeClass().addClass('color' + source.color); // X2
				game.resetSource(); // X2
				game.setSource(x, y); // X2.2
				var ball = game.getBall(x, y); // X2.2
				field.removeClass().addClass('color' + ball.color + 's'); // X2.2
			} else if (game.move(x, y)) {
				/* target valid: move source to target, reset source, check line */
				ui.resetField(source);
				field.removeClass().addClass('color' + source.color); // X2 /2 - this line already appeared 2 times
				// TODO: Ball moving along the shortest path animation
				var line = game.getLine(target);
				if (line) {
					for (var i = 0; i < line.fields.length; i++) {
						ui.resetField(line.fields[i]);
					}
					$('#score span').html(game.getScore());
				} else {
					ui.fillIn(game.fill());
				}
			} else {
				/* target unavailable: display message */
				$('#message').html('<p>Target unavailable.</p>');
			}
		} else if (game.getBall(x, y)) {
			/* set new source */
			game.setSource(x, y); // X2.2
			var ball = game.getBall(x, y); // X2.2
			field.removeClass().addClass('color' + ball.color + 's'); // X2.2
		}
	},
	resetField: function(target) {
		$('#field_' + target.x + '_' + target.y).removeClass();
	},
	init: function() {
		this.createTable();
		var newFields = game.newGame();
		this.fillIn(newFields);
	}
};

ui.init();