(function() {
	var SIZE    = 10;
	var TIMEOUT = 100;

	var cells     = [];
	var liveCells = [];

	var canvas 	= document.getElementById('canvas');

	var timer  = null;
	var blocks = null;
	var state  = null;

	var cellStates = {
		ALIVE: 	 1 << 0,
		CHECKED: 1 << 1
	};

	var gameStates = {
		STOP:  0,
		RUN:   1,
		PAUSE: 2
	};

	resetGame();

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
			updateBlock( index );

			getNeighbours( index ).forEach( updateBlock );
		} );
	}

	function updateBlock( index ) {
		if( cells[ index ] & cellStates.CHECKED ) {
			return;
		}

		var wasAlive = liveCells[index] & cellStates.ALIVE;

		var alive    = isAlive( index, wasAlive );

		cells[ index ] = alive | cellStates.CHECKED;

		if( alive != wasAlive ) {
			blocks[ index ].className = alive ? 'alive' : '';
		}
	}

	function isAlive( index, wasAlive ) {
		var count = countNeighbors( index );

		var min   = wasAlive ? 1 : 2;

		return (count > min && count < 4) ? cellStates.ALIVE : 0;
	}

	function prepare() {
		canvas.innerHTML = '';

		for(var i = 0, len = SIZE * SIZE; i < len; ++i) {
			var block = document.createElement('div');

			block.dataset.index = i;

			canvas.appendChild(block);
		}
	}

	function markBlock(e) {
		var block = e.target,
			index = block.dataset.index;

		cells[index] ^= cellStates.ALIVE;
		block.className = cells[index] ? 'alive' : '';
	}

	document.getElementById('control').addEventListener('click', function(e) {
		if( state == gameStates.STOP ) {
			canvas.removeEventListener('click', markBlock);
		}

		if( state !== gameStates.RUN ) {
			timer = setInterval(iteration, TIMEOUT);
			e.target.innerHTML = 'Pause';

			iteration();
		}
		else {
			clearInterval( timer );
			e.target.innerHTML = 'Start';
		}

		state = state == gameStates.RUN ? gameStates.PAUSE : gameStates.RUN;
	});

	function resetGame() {
		SIZE = parseInt(document.getElementById('size').value, 10);

		cells = [];

		state = gameStates.STOP;
		document.getElementById('control').innerHTML = 'Start';

		canvas.addEventListener('click', markBlock);

		canvas.style.width = (SIZE * 11) + "px";

		prepare();
		blocks = canvas.getElementsByTagName('div');

		clearInterval( timer );
	}

	document.getElementById('reset').addEventListener('click', resetGame);
	document.getElementById('size').addEventListener('keyup', function(e) {
		if( e.keyCode == 13 ) {
			resetGame();
		}
	});
})();
