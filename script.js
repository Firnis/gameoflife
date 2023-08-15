(function(document) {
	let SIZE = 0;
	let cells = [];
	let liveCells = [];

	const cellStates = {
		ALIVE: 	 1 << 0,
		CHECKED: 1 << 1
	};

	function sideCells(index, row) {
		// index, index - SIZE, index + SIZE
		const cells = [index];

		if (row > 0) {
			cells.push(index - SIZE);

			if (row < (SIZE - 1)) {
				cells.push(index + SIZE)
			}
		}

		return cells;
	}

	function getNeighbours(index) {
		const row = ~~(index / SIZE);
		const col = index % SIZE;
		const neighbors = [];

		if (col > 0) {
			// 3 cells to left
			neighbors.push(...sideCells(index - 1, row));

			if (col < (SIZE - 1)) {
				// 3 cells to right
				neighbors.push(...sideCells(index + 1, row));
			}
		}

		if (row > 0) {
			// 1 cell above
			neighbors.push(index - SIZE);

			if (row < (SIZE - 1)) {
				// 1 cell below
				neighbors.push(index + SIZE);
			}
		}

		return neighbors;
	}

	function countNeighbors(index) {
		return getNeighbours(index).reduce(function(sum, value) {
			return sum + ((liveCells[value] & cellStates.ALIVE) > 0);
		}, 0);
	}

	function iteration() {
		liveCells = cells.reduce(function(alive, cell, index) {
			if (cell & cellStates.ALIVE) {
				alive[index] |= cellStates.ALIVE;
			}
			return alive;
		}, []);

		cells = [];

		for (let i = 0; i < liveCells.length; i++) {
			updateCell(i);

			getNeighbours(i).forEach(updateCell);
		}
	}

	function updateCell(index) {
		if (cells[index] & cellStates.CHECKED) {
			return;
		}

		const wasAlive = liveCells[index] & cellStates.ALIVE;
		const alive = isAlive(index, wasAlive);

		cells[index] = alive | cellStates.CHECKED;

		if (alive != wasAlive) {
			gui.setAlive(index, alive);
		}
	}

	function isAlive(index, wasAlive) {
		const count = countNeighbors(index);
		const min = wasAlive ? 1 : 2;

		return (count > min && count < 4) ? cellStates.ALIVE : 0;
	}

	const GameUI = function() {
		this.setup();
	};

	const States = {
		STOP: 0,
		RUN: 1,
		PAUSE: 2
	};

	const TIMEOUT = 100;

	GameUI.prototype = {
		canvas: document.getElementById('canvas'),
		startBtn: document.getElementById('control'),
		resetBtn: document.getElementById('reset'),
		sizeInput: document.getElementById('size'),

		timer: null,
		state: null,
		blocks: null,

		markBlock: function(e) {
			if (this.state !== States.STOP) {
				return;
			}

			const block = e.target;
			const index = block.dataset.index;

			this.setAlive(index, cells[index] ^= cellStates.ALIVE);
		},

		setup: function () {
			const self = this;

			this.startBtn.addEventListener('click', function(e) {
				if (self.state === States.STOP) {
					self.canvas.removeEventListener('click', (e) => this.markBlock(e));
				}

				if (self.state !== States.RUN) {
					self.timer = setInterval(iteration, TIMEOUT);
					e.target.innerHTML = 'Pause';

					iteration();
				}
				else {
					clearInterval(self.timer);
					e.target.innerHTML = 'Start';
				}

				self.state = self.state == States.RUN ? States.PAUSE : States.RUN;
			});

			this.resetBtn.addEventListener('click', this.reset.bind(this));
			this.sizeInput.addEventListener('keyup', function(e) {
				if (e.key === 'Enter') {
					self.reset();
				}
			});

			this.canvas.addEventListener('click', (e) => this.markBlock(e));

			this.reset();
		},

		reset: function () {
			const size = parseInt(this.sizeInput.value, 10);

			if (size != SIZE) {
				SIZE = size;

				this.canvas.style.width = (SIZE * 11) + "px";
			}

			this.fillCanvas();

			this.blocks = this.canvas.getElementsByTagName('div');

			cells = [];

			this.state = States.STOP;
			this.startBtn.innerHTML = 'Start';

			clearInterval(this.timer);
		},

		fillCanvas: function() {
			this.canvas.innerHTML = '';

			for (let i = 0, len = SIZE * SIZE; i < len; ++i) {
				const block = document.createElement('div');

				block.dataset.index = i;

				this.canvas.appendChild(block);
			}
		},

		setAlive: function(index, alive) {
			this.blocks[index].className = alive ? 'alive' : '';
		}
	};

	const gui = new GameUI();
})(document);
