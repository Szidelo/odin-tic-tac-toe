// factory functions for GameBoard, Cell, and GameController
// players will be declared in GameController
// functionality first, UI second with separate factory functions
// logic and UI will be separated into separate factory functions

const GameBoard = () => {
	const size = 3; // size of the board
	let board = [];

	const initBoard = () => {
		board = [];
		for (let i = 0; i < size; i++) {
			const row = [];
			for (let j = 0; j < size; j++) {
				row.push(Cell());
			}
			board.push(row);
		}
	};

	initBoard();

	const resetBoard = () => {
		initBoard();
	};

	const getBoard = () => board;

	const isCellAvailable = (row, col) => {
		return board[row][col].getValue().char === "*"; // to be changed
	};

	const setCell = (row, col, char, player) => {
		// change to pass row col and a player object argument
		if (isCellAvailable(row, col)) {
			board[row][col].setValue(char, player); //player object argument
			console.log(`cell at (${row}, ${col}) has been claimed by ${player} as '${char}'`);
		} else {
			console.warn(`cell at row ${row} and col ${col} is not available`);
		}
	};

	// TODO: add a checkTie method that check that there are no cells === "*"

	const checkWinner = (playerChar) => {
		const checkPattern = (pattern) => pattern.every(([row, col]) => board[row][col].getValue().char === playerChar);

		// this is a hardcoded win patterns. TODO: try to make dynamic generateWinPatterns(size: 3x3 || 9x9 || etc)
		const winPatterns = [
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

		return winPatterns.some(checkPattern);
	};

	const printConsoleTable = () => {
		const boardValues = board.map((row) => row.map((cell) => cell.getValue().char));

		console.table(boardValues);
	};

	return { getBoard, printConsoleTable, isCellAvailable, setCell, checkWinner, resetBoard };
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
			char: "X",
			playerName: playerOneName,
		},
		{
			char: "O",
			playerName: playerTwoName,
		},
	];

	const board = GameBoard();

	let activePlayerIndex = 0;
	let gameEnded = false;
	let rounds = 0;

	const resetGame = () => {
		activePlayerIndex = 0;
		gameEnded = false;
		rounds = 0;
		board.resetBoard();
		console.log("Game is reset");
		printRound();
	};

	const switchPlayer = () => {
		activePlayerIndex = 1 - activePlayerIndex; // toggle index
		rounds++;
		console.log("+++game round:", rounds);
	};

	const getActivePlayer = () => players[activePlayerIndex];

	const printRound = () => {
		board.printConsoleTable();
		if (gameEnded) console.warn(`${getActivePlayer().playerName} won the game!`);
		console.log(`It is ${getActivePlayer().playerName}'s turn`);
	};

	const playRound = (row, col) => {
		const { char, playerName } = getActivePlayer();
		if (rounds >= 9) {
			console.warn("No more possible moves!");
			gameEnded = true;
			resetGame();
			return;
		}

		if (gameEnded) {
			console.warn("Game has ended! No more moves allowed.");
			return;
		}

		console.log(`Player ${playerName} placed ${char} at (${row}, ${col})`);

		const isAvailable = board.isCellAvailable(row, col);

		if (!isAvailable) {
			console.warn("Cell already occupied! Choose another.");
			return;
		}

		board.setCell(row, col, char, playerName);
		const winner = board.checkWinner(char);
		if (winner) {
			console.log("!! And the winner is:", playerName, "!!");
			gameEnded = true;
			printRound();
			return;
		} else {
			printRound();
			switchPlayer();
		}
	};

	printRound();

	return { playRound, getActivePlayer, resetGame };
};

console.log("--------------test 1----------------");
const game = GameController();
game.playRound(0, 0);
game.playRound(0, 1);
game.playRound(0, 2);
game.playRound(1, 0);
game.playRound(1, 1);
game.playRound(1, 2);
game.playRound(2, 0);
game.playRound(2, 2);
game.playRound(2, 1);
