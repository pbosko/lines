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
	},
	fieldClicked: function(event) {
		if (ui.disabled || game.occupiedFieldsCount === game.totalFields) {
			return;
		}
		var i;
		var field = $(this);
		var idArr = field.attr('id').split('_');
		var x = parseInt(idArr[1], 10);
		var y = parseInt(idArr[2], 10);
		ui.source = game.getSource();
		ui.target = {x: x, y: y};
		if (ui.source) {
			if (ui.source.x === ui.target.x && ui.source.y === ui.target.y) {
				/* target same as ui.source: reset ui.source */
				field.removeClass().addClass('color' + ui.source.color); // X2
				game.resetSource(); // X2
			} else if (game.getBall(ui.target.x, ui.target.y)) {
				/* target occupied: target becomes new ui.source */
				$('#field_' + ui.source.x + '_' + ui.source.y).removeClass().addClass('color' + ui.source.color); // X2
				game.resetSource(); // X2
				game.setSource(ui.target); // X2.2
				var ball = game.getBall(ui.target.x, ui.target.y); // X2.2
				field.removeClass().addClass('color' + ball.color + 's'); // X2.2
			} else if (game.move(x, y)) {
				/* target valid: move ui.source to target, reset ui.source, check line */
				ui.path = game.getPath();
				ui.disabled = true;
				ui.prev = ui.source;
				ui.animation = setInterval(function() { ui.animate(); }, 50);
			} else {
				/* target unavailable: display message */
				$('#message').html('<p>Target unavailable.</p>');
			}
		} else if (game.getBall(ui.target.x, ui.target.y)) {
			/* set new source */
			game.setSource(ui.target); // X2.2
			var ball = game.getBall(ui.target.x, ui.target.y); // X2.2
			field.removeClass().addClass('color' + ball.color + 's'); // X2.2
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
	setField: function(target) {
		$('#field_' + target.x + '_' + target.y).removeClass().addClass('color' + this.source.color);
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
