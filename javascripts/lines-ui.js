var ui = {
	animation: null,
	disabled: false,
	path: [],
	prev: null,
	source: null,
	target: null,
	createTable: function() {
		var table = $('#table');
		for (var i = 0; i < game.sideSize; i ++) {
			for (var j = 0; j < game.sideSize; j ++) {
				$('<div id="field_' + i + '_' + j + '"></div>').appendTo(table);
				$('#field_' + i + '_' + j).click(this.fieldClicked);
			}
		}
	},
	fillIn: function(newFields) {
		for (var i = 0; i < newFields.length; i ++) {
			$('#field_' + newFields[i].x + '_' + newFields[i].y).removeClass().addClass('color' + newFields[i].color);
		}
		for (i = 0; i < newFields.length; i ++) {
			var line = game.getLine(newFields[i]);
			if (line) {
				this.clearLine(line);
			}
		}
		if (game.isGameOver()) {
			var record = localStorage.getItem('record') && parseInt(localStorage.getItem('record')) || 0;
			if (game.getScore() > record) {
				localStorage.setItem('record', game.getScore());
				this.displayRecord();
			}
		}
		var nextColors = game.getNextColors();
		for (i = 0; i < nextColors.length; i ++) {
			$('#forecast_' + i).removeClass().addClass('color' + nextColors[i]);
		}
	},
	fieldClicked: function(event) {
		if (ui.disabled || game.occupiedFieldsCount === game.totalFields) {
			return;
		}
		var idArr = $(this).attr('id').split('_');
		ui.source = game.getSource();
		ui.target = {x: parseInt(idArr[1], 10), y: parseInt(idArr[2], 10)};
		if (ui.source) {
			if (ui.source.x === ui.target.x && ui.source.y === ui.target.y) {
				ui.unmarkField(ui.source);
			} else if (game.getBall(ui.target)) {
				/* target occupied: target becomes new ui.source */
				ui.unmarkField(ui.source);
				ui.markField(ui.target);
			} else if (game.move(ui.target)) {
				/* target valid: move ui.source to target, reset ui.source, check line */
				ui.path = game.getPath();
				ui.disabled = true;
				ui.prev = ui.source;
				ui.animation = setInterval(function() { ui.animate(); }, 50);
			} else {
				/* target unavailable: display message */
				$('#message').html('<p>Target unavailable.</p>');
			}
		} else if (game.getBall(ui.target)) {
			/* sets new source */
			ui.markField(ui.target);
		}
	},
	animate: function() {
		if (this.path.length > 0) {
			this.resetField(this.prev);
			this.prev = this.path.shift();
			this.setField(this.prev);
		} else {
			clearInterval(this.animation);
			this.setField(this.target);
			var line = game.getLine(this.target);
			if (line) {
				this.clearLine(line);
			} else {
				this.fillIn(game.fill());
			}
			this.disabled = false;
		}
	},
	clearLine: function(line) {
		for (var i = 0; i < line.fields.length; i++) {
			this.resetField(line.fields[i]);
		}
		$('#score span').html(game.getScore());
	},
	displayRecord: function() {
		$('#highscore span').html(localStorage.getItem('record') || 0);
	},
	markField: function(target) {
		game.setSource(target);
		var ball = game.getBall(target);
		$('#field_' + target.x + '_' + target.y).removeClass().addClass('color' + ball.color + 's');
	},
	unmarkField: function(source) {
		$('#field_' + source.x + '_' + source.y).removeClass().addClass('color' + source.color);
		game.resetSource();
	},
	setField: function(target) {
		$('#field_' + target.x + '_' + target.y).removeClass().addClass('color' + this.source.color);
	},
	resetField: function(target) {
		$('#field_' + target.x + '_' + target.y).removeClass();
	},
	init: function() {
		this.displayRecord();
		this.createTable();
		var newFields = game.newGame();
		this.fillIn(newFields);
	}
};

ui.init();
