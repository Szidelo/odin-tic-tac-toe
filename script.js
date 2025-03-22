// factory functions for GameBoard, Cell, and GameController
// players will be declared in GameController
// functionality first, UI second with separate factory functions
// logic and UI will be separated into separate factory functions

const GameBoard = (gridSize = 3) => {
	let size = gridSize;
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
		return board[row][col].getValue().playerName === null; // to be changed
	};

	const setCell = (row, col, char, player) => {
		// change to pass row col and a player object argument
		if (isCellAvailable(row, col)) {
			board[row][col].setValue(char, player); //player object argument
		} else {
			console.warn(`cell at row ${row} and col ${col} is not available`);
		}
	};

	const checkTie = () => board.flat().every((cell) => cell.getValue().playerName !== null);

	const generateWinPatterns = () => {
		const rows = [];
		const cols = [];
		const diagonal = [];
		const antiDiagonal = [];

		for (let i = 0; i < size; i++) {
			const rowPattern = [];
			const colPattern = [];

			for (let j = 0; j < size; j++) {
				rowPattern.push([i, j]);
				colPattern.push([j, i]);
			}

			rows.push(rowPattern);
			cols.push(colPattern);

			diagonal.push([i, i]);
			antiDiagonal.push([i, size - 1 - i]);
		}

		return [...rows, ...cols, diagonal, antiDiagonal];
	};

	const checkWinner = (playerChar) => {
		const checkPattern = (pattern) => pattern.every(([row, col]) => board[row][col].getValue().char === playerChar);

		const winPatterns = generateWinPatterns();

		return winPatterns.some(checkPattern);
	};

	const printConsoleTable = () => {
		const boardValues = board.map((row) => row.map((cell) => cell.getValue().char));
		console.table(boardValues);
	};

	return { getBoard, printConsoleTable, isCellAvailable, setCell, checkWinner, resetBoard, generateWinPatterns, checkTie };
};

const Cell = () => {
	const value = {
		char: "*",
		playerName: null,
	};

	const getValue = () => value;

	const setValue = (char, player) => {
		value.char = char;
		value.playerName = player;
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
		printRound();
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
			printRound();
			console.log("!! And the winner is:", playerName, "!!");
			gameEnded = true;
			return;
		} else {
			switchPlayer();
		}
		if (board.checkTie()) {
			console.warn(`game ended in a tie, rounds played: ${rounds}`);
			gameEnded = true;
			return;
		}
	};

	printRound();

	return { playRound, getActivePlayer, resetGame };
};

// console.log("--------------test 1 3x3 grid attempt to check cell after game is won----------------");
// const game = GameController();
// game.playRound(0, 0);
// game.playRound(0, 1);
// game.playRound(0, 2);
// game.playRound(1, 0);
// game.playRound(1, 1);
// game.playRound(1, 2);
// game.playRound(2, 0);
// game.playRound(2, 2);
// game.playRound(2, 1);
// game.playRound(1, 1);
// game.playRound(2, 2);

// console.log("--------------test 1 3x3 grid check tie if all cells are checked----------------");

// const game2 = GameController();
// game2.playRound(0, 0); // X
// game2.playRound(0, 1); // O
// game2.playRound(0, 2); // X
// game2.playRound(1, 1); // O
// game2.playRound(1, 0); // X
// game2.playRound(1, 2); // O
// game2.playRound(2, 1); // X
// game2.playRound(2, 0); // O
// game2.playRound(2, 2); // X
