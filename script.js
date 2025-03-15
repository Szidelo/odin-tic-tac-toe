// factory functions for GameBoard, Cell, and GameController
// players will be declared in GameController
// functionality first, UI second with separate factory functions
// logic and UI will be separated into separate factory functions

const GameBoard = () => {
	const size = 3; // size of the board
	const board = [];

	for (let i = 0; i < size; i++) {
		const row = [];
		for (let j = 0; j < size; j++) {
			row.push(Cell());
		}
		board.push(row);
	}

	const getBoard = () => board;

	const checkCell = (row, col, player, char) => {
		const cell = board[row][col];
		let isCellAvailable = false;
		if (cell.getValue().char === "*") {
			isCellAvailable = true;
			console.log(`Cell at (${row}, ${col}) is available:`, cell.getValue());
		} else {
			isCellAvailable = false;
			console.log(`Cell at (${row}, ${col}) is occupied by ${cell.getValue().player} with ${cell.getValue().char}`);
		}

		isCellAvailable && cell.setValue(char, player);
	};

	const print = () => {
		const boardValues = board.map((row) => row.map((cell) => cell.getValue().char));
		console.table(boardValues);
	};

	return { getBoard, print, checkCell };
};

const Cell = () => {
	const value = {
		player: null,
		char: "*",
	};

	const getValue = () => value;

	const setValue = (char, player) => {
		value.char = char;
		value.player = player;
	};

	return { getValue, setValue };
};

const GameController = (playerOneName = "Player One", playerTwoName = "Player Two") => {
	const players = [
		{
			char: "x",
			playerName: playerOneName,
		},
		{
			char: "0",
			playerName: playerTwoName,
		},
	];

	const board = GameBoard();

	let activePlayer = players[0];

	const switchPlayer = () => {
		activePlayer = activePlayer === players[0] ? players[1] : players[0];
	};
	const getActivePlayer = () => activePlayer;

	const printRound = () => {
		board.print();
		console.log(`It is ${getActivePlayer().playerName}'s turn`);
	};

	const playRound = (row, col) => {
		console.log(`Player ${getActivePlayer().playerName} checked with ${getActivePlayer().char} at ${row} -> ${col} `);
		board.checkCell(row, col, getActivePlayer().playerName, getActivePlayer().char);
		switchPlayer();
		printRound();
	};

	printRound();

	return { playRound, getActivePlayer };
};

const game = GameController();
game.playRound(1, 1);
game.playRound(0, 0);
game.playRound(2, 2);
game.playRound(0, 1);
game.playRound(2, 1);
game.playRound(0, 2);
