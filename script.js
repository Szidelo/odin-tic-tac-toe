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

	const isCellAvailable = (row, col) => {
		return board[row][col].getValue().char === "*"; // to be changed
	};

	const setCell = (row, col, char, player) => {
		// change to pass row col and a player object argument
		if (isCellAvailable(row, col)) {
			board[row][col].setValue(char, player); //player object argument
			console.log(`cell at row ${row}, col ${col} as been set by ${player} with ${char}`);
		}
	};

	const checkWinner = (playerChar) => {
		const winConditions = [
			// Rows
			[
				[0, 0],
				[0, 1],
				[0, 2],
			],
			[
				[1, 0],
				[1, 1],
				[1, 2],
			],
			[
				[2, 0],
				[2, 1],
				[2, 2],
			],
			// Columns
			[
				[0, 0],
				[1, 0],
				[2, 0],
			],
			[
				[0, 1],
				[1, 1],
				[2, 1],
			],
			[
				[0, 2],
				[1, 2],
				[2, 2],
			],
			// Diagonals
			[
				[0, 0],
				[1, 1],
				[2, 2],
			],
			[
				[0, 2],
				[1, 1],
				[2, 0],
			],
		];

		return winConditions.some((pattern) => pattern.every(([row, col]) => board[row][col].getValue().char === playerChar));
	};

	const print = () => {
		const boardValues = board.map((row) => row.map((cell) => cell.getValue().char)); // not easy to understand. come with your solution
		console.table(boardValues);
	};

	return { getBoard, print, isCellAvailable, setCell, checkWinner };
};

const Cell = () => {
	const value = {
		char: "*",
		player: null,
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

	let activePlayerIndex = 0;

	const switchPlayer = () => {
		activePlayerIndex = 1 - activePlayerIndex; // toggle index
	};

	const getActivePlayer = () => players[activePlayerIndex];

	const printRound = () => {
		board.print();
		console.log(`It is ${getActivePlayer().playerName}'s turn`);
	};

	const playRound = (row, col) => {
		console.log(`Player ${getActivePlayer().playerName} checked with ${getActivePlayer().char} at ${row} -> ${col} `);
		const cell = board.isCellAvailable(row, col);
		cell && board.setCell(row, col, getActivePlayer().char, getActivePlayer().playerName);
		const winner = board.checkWinner(getActivePlayer().char);
		console.log("winner:", winner);
		if (winner) {
			console.log("------------------------------And the winner is:", getActivePlayer().playerName);
			printRound();
			return;
		} else {
			printRound();
			switchPlayer();
		}
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
