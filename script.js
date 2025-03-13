// factory functions for GameBoard, Cell, and GameController
// players will be declared in GameController
// functionality first, UI second with separate factory functions
// logic and UI will be separated into separate factory functions

const GameBoard = () => {
	const rows = 3;
	const columns = 3;
	const board = [];

	for (let i = 0; i < rows; i++) {
		const row = [];
		for (let j = 0; j < columns; j++) {
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
			console.log(`Cell at (${row}, ${col}) is occupied by Player ${cell.getValue().player} with ${cell.getValue().char}`);
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
const p1 = "Player One";
const p2 = "Player Two";
const game = GameBoard();
game.print();
console.log("-------------");
game.checkCell(0, 0, p1, "x");
game.checkCell(0, 1, p2, "0");
game.checkCell(0, 0, p1, "x");
game.print();
