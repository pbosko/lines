var game = {
	sideSize: 9,
	totalFields: 81,
	fieldsPerTurn: 3,
	totalColors: 7,
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
						this.occupiedFields[i][j] = ball;
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
		if (i >= 0 && i < this.sideSize && j >= 0 && j < this.sideSize && this.occupiedFields[i][j] !== null) {
			this.source = this.occupiedFields[i][j];
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
		if (i >= 0 && i < this.sideSize && j >= 0 && j < this.sideSize) {
			res = this.occupiedFields[i][j];
		}
		return res;
	},
	move: function(i, j) {
		var res = false;
		if (i >= 0 && i < this.sideSize && j >= 0 && j < this.sideSize) {
			if (this.source) {
				if (this.source !== i && this.source !== j) {
					if (!this.occupiedFields[i][j]) {
						this.occupiedFields[i][j] = this.source;
						this.occupiedFields[this.source.x][this.source.y] = null;
						this.resetSource();
						res = true;
					}
				}
			}
		}
		return res;
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
		$('#debug').html('');
		for (var i = 0; i < newFields.length; i ++) {
			$('#field_' + newFields[i].x + '_' + newFields[i].y).removeClass().addClass('color' + newFields[i].color);
			$('#debug').html($('#debug').html() + '<p>' + i + ': ' + '#' + newFields[i].x + '_' + newFields[i].y + '</p>');
		}
	},
	fieldClicked: function(event) {
		var field = $(this);
		var idArr = field.attr('id').split('_');
		var x = parseInt(idArr[1], 10);
		var y = parseInt(idArr[2], 10);
		if (game.getSource()) {
			var source = game.getSource();
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
				$('#field_' + source.x + '_' + source.y).removeClass();
				field.removeClass().addClass('color' + source.color); // X2 /2 - this line already appeared 2 times
				// TODO: Ball moving along the shortest path animation
				ui.fillIn(game.fill());
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
	init: function() {
		this.createTable();
		var newFields = game.newGame();
		this.fillIn(newFields);
	}
};

ui.init();