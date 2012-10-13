var bp;
bp.ui = (function () {
	"use strict";

	function LinesUI() {
		this.game = null;
		this.animation = null;
		this.disabled = false;
		this.path = [];
		this.prev = null;
		this.source = null;
		this.target = null;
	}

	LinesUI.prototype = {
		createTable: function () {
			var i, j, table = $('#table');
			for (i = 0; i < this.game.sideSize; i += 1) {
				for (j = 0; j < this.game.sideSize; j += 1) {
					$('<div id="field_' + i + '_' + j + '"></div>').appendTo(table);
					$('#field_' + i + '_' + j).click(this.fieldClicked);
				}
			}
		},
		fillIn: function (newFields) {
			var i, line, record, nextColors;
			for (i = 0; i < newFields.length; i += 1) {
				$('#field_' + newFields[i].x + '_' + newFields[i].y).removeClass().addClass('color' + newFields[i].color);
			}
			for (i = 0; i < newFields.length; i += 1) {
				line = this.game.getLine(newFields[i]);
				if (line) {
					this.clearLine(line);
				}
			}
			if (this.game.isGameOver()) {
				record = (localStorage.getItem('record') && parseInt(localStorage.getItem('record'), 10)) || 0;
				if (this.game.getScore() > record) {
					localStorage.setItem('record', this.game.getScore());
					this.displayRecord();
				}
			}
			nextColors = this.game.getNextColors();
			for (i = 0; i < nextColors.length; i += 1) {
				$('#forecast_' + i).removeClass().addClass('color' + nextColors[i]);
			}
		},
		fieldClicked: function () {
			var idArr, target;
			idArr = $(this).attr('id').split('_');
			target = {x: parseInt(idArr[1], 10), y: parseInt(idArr[2], 10)};
			bp.ui.handleClick(target);
		},
		handleClick: function (target) {
			var me;
			if (this.disabled || this.game.occupiedFieldsCount === this.game.totalFields) {
				return;
			}
			this.source = this.game.getSource();
			this.target = target;
			if (this.source) {
				if (this.source.x === this.target.x && this.source.y === this.target.y) {
					this.unmarkField(this.source);
				} else if (this.game.getBall(this.target)) {
					/* target occupied: target becomes new this.source */
					this.unmarkField(this.source);
					this.markField(this.target);
				} else if (this.game.move(this.target)) {
					/* target valid: move this.source to target, reset this.source, check line */
					this.path = this.game.getPath();
					this.disabled = true;
					this.prev = this.source;
					me = this;
					this.animation = setInterval(function () { me.animate(); }, 50);
				} else {
					/* target unavailable: display message */
					$('#message').html('<p>Target unavailable.</p>');
				}
			} else if (this.game.getBall(this.target)) {
				/* sets new source */
				this.markField(this.target);
			}
		},
		animate: function () {
			var line;
			if (this.path.length > 0) {
				this.resetField(this.prev);
				this.prev = this.path.shift();
				this.setField(this.prev);
			} else {
				clearInterval(this.animation);
				this.setField(this.target);
				line = this.game.getLine(this.target);
				if (line) {
					this.clearLine(line);
				} else {
					this.fillIn(this.game.fill());
				}
				this.disabled = false;
			}
		},
		clearLine: function (line) {
			var i;
			for (i = 0; i < line.fields.length; i += 1) {
				this.resetField(line.fields[i]);
			}
			$('#score span').html(this.game.getScore());
		},
		displayRecord: function () {
			$('#highscore span').html(localStorage.getItem('record') || 0);
		},
		markField: function (target) {
			var ball;
			this.game.setSource(target);
			ball = this.game.getBall(target);
			$('#field_' + target.x + '_' + target.y).removeClass().addClass('color' + ball.color + 's');
		},
		unmarkField: function (source) {
			$('#field_' + source.x + '_' + source.y).removeClass().addClass('color' + source.color);
			this.game.resetSource();
		},
		setField: function (target) {
			$('#field_' + target.x + '_' + target.y).removeClass().addClass('color' + this.source.color);
		},
		resetField: function (target) {
			$('#field_' + target.x + '_' + target.y).removeClass();
		},
		init: function (game) {
			this.game = game;
			this.displayRecord();
			this.createTable();
			var newFields = this.game.newGame();
			this.fillIn(newFields);
		}
	};

	return new LinesUI();
}());

bp.ui.init(window.bp.game);
