// factory functions for GameBoard, Cell, and GameController
// players will be declared in GameController
// functionality first, UI second with separate factory functions
// logic and UI will be separated into separate factory functions

const LANGUAGES = {
	ENGLISH: "en",
	GERMAN: "de",
	ITALIAN: "it",
	ROMANIAN: "ro",
	HUNGARIAN: "hu",
};

const LanguageManager = () => {
	let currentLanguage = localStorage.getItem("lng") || LANGUAGES.ENGLISH;
	let translations = null; // to store translations

	const getCurrentLanguage = () => currentLanguage;

	const setLanguage = (lang) => {
		currentLanguage = lang;
		localStorage.setItem("lng", lang);
	};

	const getTranslations = async () => {
		if (!translations) {
			const response = await fetch("./translations.JSON");
			const data = await response.json();
			translations = data; // store translations
		}
		return translations[getCurrentLanguage()];
	};

	return { setLanguage, getCurrentLanguage, getTranslations };
};

const GameBoard = (gridSize = 3) => {
	const size = gridSize;
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
		initBoard(); // reinitialize the board
	};

	const getBoard = () => board;

	const isCellAvailable = (row, col) => {
		return board[row][col].getValue().char === "*"; // check if the cell is empty
	};

	const setCell = (row, col, char, player) => {
		// change to pass row col and a player object argument
		if (isCellAvailable(row, col)) {
			board[row][col].setValue(char, player); //player object argument
		} else {
			console.warn(`cell at row ${row} and col ${col} is not available`); // if i reset the game and try to set a cell that was already set, it will not work
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

	const winPatterns = generateWinPatterns(); // by declaring it here, we can use it in checkWinner and it will not be recreated every time
	// this will be called only once, when the board is created

	const checkWinner = (playerChar) => {
		const checkPattern = (pattern) => pattern.every(([row, col]) => board[row][col].getValue().char === playerChar);

		return winPatterns.some(checkPattern);
	};

	const printConsoleTable = () => {
		const boardValues = board.map((row) => row.map((cell) => cell.getValue().playerName));
		console.table(boardValues);
	};

	return {
		getBoard,
		printConsoleTable,
		isCellAvailable,
		setCell,
		checkWinner,
		resetBoard,
		generateWinPatterns,
		checkTie,
	};
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
	let winner = null;

	const setWinner = (player) => {
		winner = player;
	};

	const getWinner = () => winner;

	const score = {
		playerOne: 0,
		playerTwo: 0,
	};

	const getScore = () => score;

	const setScore = (player) => {
		if (player === players[0].playerName) {
			score.playerOne++;
		} else if (player === players[1].playerName) {
			score.playerTwo++;
		}
	};

	const resetGame = () => {
		activePlayerIndex = 0;
		gameEnded = false;
		rounds = 0;
		board.resetBoard();
		setWinner(null);
		printRound();
	};

	const switchPlayer = () => {
		activePlayerIndex = 1 - activePlayerIndex; // toggle index
		rounds++;
		printRound();
	};

	const getActivePlayer = () => players[activePlayerIndex];

	const printRound = () => {
		board.printConsoleTable();
		if (gameEnded) console.warn(`${getActivePlayer().playerName} won the game!`);
	};

	const playRound = (row, col) => {
		const { char, playerName } = getActivePlayer();

		if (gameEnded) {
			console.warn("Game has ended! No more moves allowed.");
			return;
		}

		const isAvailable = board.isCellAvailable(row, col);

		if (!isAvailable) {
			console.warn("Cell already occupied! Choose another.");
			return;
		}

		board.setCell(row, col, char, playerName);
		const isWon = board.checkWinner(char);
		if (isWon) {
			printRound();
			setWinner(playerName);
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

	return { playRound, getActivePlayer, resetGame, getWinner, getScore, setScore };
};

const GameUI = () => {
	const game = GameController();
	const board = GameBoard();
	const languageManager = LanguageManager();
	const mainTitle = document.querySelector("#main-title");
	const btnSolo = document.querySelector("#btn-solo");
	const btnWithFriend = document.querySelector("#btn-friend");
	const btnRules = document.querySelector("#btn-rules");
	const btnRulesGame = document.querySelector("#btn-rules-game");
	const btnReset = document.querySelector("#reset-game");
	const btnHome = document.querySelector("#btn-home");
	const btnBack = document.querySelector("#btn-back");
	const rulesTitle = document.querySelector("#rules-title");
	const rulesContent = document.querySelectorAll(".rules-content");
	const languageSelect = document.querySelector("#language-select");
	const settingsSection = document.querySelector("#settings");
	const gameSection = document.querySelector("#game");
	const rulesSection = document.querySelector("#rules");
	const cells = document.querySelectorAll(".cell");
	const playerOneScore = document.querySelector("#player1-score");
	const playerTwoScore = document.querySelector("#player2-score");
	const turn = document.querySelector("#turn");
	const difficultyMode = document.querySelector("#difficulty-mode");

	Object.entries(LANGUAGES).forEach(([key, value]) => {
		const option = document.createElement("option");
		option.setAttribute("value", value);
		option.textContent = key.toLowerCase();
		languageSelect.appendChild(option);

		if (languageManager.getCurrentLanguage() === option.value) {
			option.setAttribute("selected", true);
		}
	});

	const updateText = (data) => {
		const { titles, buttons, difficulty, turn_text, rules, rules_titles, game_rules_header } = data;
		mainTitle.textContent = titles.main;
		btnSolo.textContent = buttons.play_solo;
		btnWithFriend.textContent = buttons.play_friend;
		btnRules.textContent = buttons.game_rules;
		btnRulesGame.textContent = buttons.game_rules;
		btnReset.textContent = buttons.reset_game;
		difficultyMode.textContent = difficulty.easy;
		turn.textContent = turn_text.player;
		rulesTitle.textContent = game_rules_header;
		rulesContent.forEach((content, index) => {
			const title = content.querySelector(".rules-content-title");
			const paragraph = content.querySelector(".rules-content-paragraph");

			title.textContent = rules_titles[Object.keys(rules_titles)[index]];
			paragraph.textContent = rules[Object.keys(rules)[index]];
		});
	};

	const fillBoard = (player, cell) => {
		const row = cell.dataset.row;
		const col = cell.dataset.col;
		board.setCell(row, col, player.char, player.playerName);
		cell.textContent = player.char;
		cell.classList.add(player.char.toLowerCase());
	};

	const updateUI = async () => {
		const data = await languageManager.getTranslations();
		updateText(data);
	};

	const handleLanguageChange = async (event) => {
		languageManager.setLanguage(event.target.value);
		await updateUI();
	};

	const updateScore = (winner) => {
		game.setScore(winner);
		playerOneScore.textContent = game.getScore().playerOne;
		playerTwoScore.textContent = game.getScore().playerTwo;
	};

	const checkIfGameIsWon = () => !!game.getWinner();

	const fillWinningPattern = (activePlayer) => {
		const winningPattern = board
			.generateWinPatterns()
			.find((pattern) => pattern.every(([row, col]) => board.getBoard()[row][col].getValue().char === activePlayer.char));

		if (winningPattern) {
			winningPattern.forEach(([row, col]) => {
				const winningCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
				if (winningCell) {
					winningCell.classList.add("filled");
				}
			});
		}
	};

	const handleTurnMessage = async (activePlayer) => {
		const translations = await languageManager.getTranslations();
		const turn_text = translations.turn_text;

		if (activePlayer.playerName === "Player One") {
			turn.textContent = turn_text.player;
		} else if (activePlayer.playerName === "Player Two") {
			turn.textContent = turn_text.opponent;
		}
	};

	const handleWin = async (activePlayer) => {
		const translations = await languageManager.getTranslations();
		const text = translations.game_over;
		fillWinningPattern(activePlayer);
		const winner = game.getWinner();
		updateScore(winner);
		turn.textContent = winner === "Player One" ? text.win : text.defeat;
		setTimeout(() => {
			btnReset.click();
		}, 2000);
	};

	const handleTie = async () => {
		const translations = await languageManager.getTranslations();
		const text = translations.game_over;
		turn.textContent = text.draw;
		setTimeout(() => {
			btnReset.click();
		}, 2000);
		return;
	};

	const handleEvents = (() => {
		languageSelect.addEventListener("change", handleLanguageChange);
		btnSolo.addEventListener("click", () => {
			settingsSection.style.display = "none";
			gameSection.style.display = "block";
		});
		btnHome.addEventListener("click", () => {
			settingsSection.style.display = "block";
			gameSection.style.display = "none";
		});
		btnBack.addEventListener("click", () => {
			rulesSection.classList.add("hidden");
		});
		[btnRules, btnRulesGame].forEach((btn) => {
			btn.addEventListener("click", () => {
				rulesSection.classList.remove("hidden");
			});
		});
		btnReset.addEventListener("click", async () => {
			const translations = await languageManager.getTranslations();
			const text = translations.turn_text.player;
			board.resetBoard();
			game.resetGame();
			turn.textContent = text;
			cells.forEach((cell) => {
				cell.textContent = "";
				cell.classList.remove("filled");
				cell.classList.remove("x");
				cell.classList.remove("o");
			});
		});
	})();

	const handlePlayerCheck = (() => {
		const isCellAvailable = (cell) => cell.textContent === "" && !game.getWinner();
		document.addEventListener("click", (e) => {
			if (e.target.classList.contains("cell")) {
				const cell = e.target;
				if (!isCellAvailable(cell)) return; // check if the cell is available

				const row = cell.dataset.row;
				const col = cell.dataset.col;

				const activePlayer = game.getActivePlayer();
				game.playRound(row, col);
				fillBoard(activePlayer, cell);

				if (game.getWinner() === null && !board.checkTie()) {
					const nextPlayer = game.getActivePlayer();
					handleTurnMessage(nextPlayer);
				}

				setTimeout(() => {
					if (checkIfGameIsWon()) {
						handleWin(activePlayer);
						return;
					}
					if (board.checkTie()) {
						handleTie();
						return;
					}
				}, 300);
			}
		});
	})();

	return { updateUI };
};

const gameUI = GameUI();
gameUI.updateUI();
