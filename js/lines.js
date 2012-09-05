var game = {
	sideSize: 9,
	totalFields: 81,
	fieldsPerTurn: 3,
	occupiedFields: new Array(),
	occupiedFieldsCount: 0,
	newGame: function() {
		for (var i = 0; i < this.sideSize; i ++) {
			this.occupiedFields[i] = new Array(10);
			for (var j = 0; j < this.sideSize; j ++) {
				this.occupiedFields[i][j] = undefined;
			}
		}
		return this.fill();
	},
	newBall: function() {
		var rnd = Math.floor(Math.random() * (this.totalFields - this.occupiedFieldsCount));
		var cnt = 0;
		for (var i = 0; i < this.sideSize; i ++) {
			for (var j = 0; j < this.sideSize; j ++) {
				if (this.occupiedFields[i][j] === undefined) {
					if (cnt >= rnd) {
						this.occupiedFieldsCount ++;
						this.occupiedFields[i][j] = 'x';
						return {x: i, y: j};
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
	}
};

var ui = {
	sideSize: 9,
	createTable: function() {
		var table = $('#table');
		for (var i = 0; i < this.sideSize; i ++) {
			for (var j = 0; j < this.sideSize; j ++) {
				$('<div id="' + i + '_' + j + '"></div>').appendTo(table);
			}
		}
	},
	fillIn: function(newFields) {
		for (var i = 0; i < newFields.length; i ++) {
			$('#' + newFields[i].x + '_' + newFields[i].y).html('x');
			$('#debug').html($('#debug').html() + '<p>' + i + ': ' + '#' + newFields[i].x + '_' + newFields[i].y + '</p>');
		}
	},
	init: function() {
		this.createTable();
		var newFields = game.newGame();
		this.fillIn(newFields);
	}
};

ui.init();