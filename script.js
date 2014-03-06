(function() {
	var SIZE    = 0;

	var cells     = [];
	var liveCells = [];

	var cellStates = {
		ALIVE: 	 1 << 0,
		CHECKED: 1 << 1
	};

	function sideCells( index, row ) {
		var cells = [];

		// index, index - SIZE, index + SIZE
		cells.push( index );

		if( row > 0 ) {
			cells.push( index - SIZE );

			if( row < ( SIZE - 1 ) ) {
				cells.push( index + SIZE )
			}
		}

		return cells;
	}

	function getNeighbours( index ) {
		var row = ~~(index / SIZE);
		var col = index % SIZE;

		var neighbors = [];

		if( col > 0 ) {
			// 3 cells to left
			neighbors = neighbors.concat( sideCells( index - 1, row ) );

			if( col < ( SIZE - 1 ) ) {
				// 3 cells to right
				neighbors = neighbors.concat( sideCells( index + 1, row ) );
			}
		}
		
		if( row > 0 ) {
			// 1 cell above
			neighbors.push( index - SIZE );

			if( row < ( SIZE - 1 ) ) {
				// 1 cell below
				neighbors.push( index + SIZE );
			}
		}

		return neighbors;
	}

	function countNeighbors( index ) {
		return getNeighbours( index ).reduce(function(sum, value) {
			return sum + ( (liveCells[value] & cellStates.ALIVE) > 0 );
		}, 0);
	}

	function iteration() {
		liveCells = cells.reduce(function(alive, cell, index) {
			if( cell & cellStates.ALIVE ) {
				alive[ index ] |= cellStates.ALIVE;
			}
			return alive;
		}, []);

		cells = [];

		liveCells.forEach( function(val, index) {
			updateCell( index );

			getNeighbours( index ).forEach( updateCell );
		} );
	}

	function updateCell( index ) {
		if( cells[ index ] & cellStates.CHECKED ) {
			return;
		}

		var wasAlive = liveCells[index] & cellStates.ALIVE;

		var alive    = isAlive( index, wasAlive );

		cells[ index ] = alive | cellStates.CHECKED;

		if( alive != wasAlive ) {
			gui.setAlive( index, alive );
		}
	}

	function isAlive( index, wasAlive ) {
		var count = countNeighbors( index );

		var min   = wasAlive ? 1 : 2;

		return (count > min && count < 4) ? cellStates.ALIVE : 0;
	}

	var GameUI = function() {
		this.setup();
	};

	GameUI.prototype = {
		canvas:    document.getElementById('canvas'),
		startBtn:  document.getElementById('control'),
		resetBtn:  document.getElementById('reset'),
		sizeInput: document.getElementById('size'),

		timer:  null,
		state:  null,
		blocks: null,

		timeout: 100,

		states: {
			STOP:  0,
			RUN:   1,
			PAUSE: 2
		},

		markBlock: function(e) {
			var block = e.target,
				index = block.dataset.index;

			cells[index] ^= cellStates.ALIVE;
			block.className = cells[index] ? 'alive' : '';
		},

		setup: function () {
			var self = this;

			this.startBtn.addEventListener('click', function(e) {
				if( self.state == self.states.STOP ) {
					self.canvas.removeEventListener('click', this.markBlock);
				}

				if( self.state !== self.states.RUN ) {
					self.timer = setInterval(iteration, self.timeout);
					e.target.innerHTML = 'Pause';

					iteration();
				}
				else {
					clearInterval( self.timer );
					e.target.innerHTML = 'Start';
				}

				self.state = self.state == self.states.RUN ? self.states.PAUSE : self.states.RUN;
			});

			this.resetBtn.addEventListener('click', this.reset.bind(this));
			this.sizeInput.addEventListener('keyup', function(e) {
				if( e.keyCode == 13 ) {
					self.reset();
				}
			});

			this.reset();
		},

		reset: function () {
			var size = parseInt(this.sizeInput.value, 10);

			if( size != SIZE ) {
				SIZE = size;
				this.fillCanvas();
				this.blocks = this.canvas.getElementsByTagName('div');

				this.canvas.style.width = (SIZE * 11) + "px";
			}
			else {
				var liveCells = canvas.getElementsByClassName('alive');

				for (var i = liveCells.length - 1; i >= 0; i--) {
					liveCells[i].className = '';
				}
			}

			cells = [];

			this.state = this.states.STOP;
			this.startBtn.innerHTML = 'Start';

			this.canvas.addEventListener('click', this.markBlock);

			clearInterval( this.timer );
		},

		fillCanvas: function() {
			this.canvas.innerHTML = '';

			for(var i = 0, len = SIZE * SIZE; i < len; ++i) {
				var block = document.createElement('div');

				block.dataset.index = i;

				this.canvas.appendChild(block);
			}
		},

		setAlive: function( index, alive ) {
			this.blocks[ index ].className = alive ? 'alive' : '';
		}
	};

	var gui = new GameUI();
})();
