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

const FLAGS = {
	en: "https://flagcdn.com/w40/gb.png",
	de: "https://flagcdn.com/w40/de.png",
	it: "https://flagcdn.com/w40/it.png",
	ro: "https://flagcdn.com/w40/ro.png",
	hu: "https://flagcdn.com/w40/hu.png",
};

const MODES = {
	PVP: "Player vs Player",
	PVC: "Player vs Computer",
};

const DIFFICULTIES = {
	EASY: "easy",
	INTERMEDIATE: "intermediate",
	HARD: "hard",
	IMPOSSIBLE: "impossible",
};

const LanguageManager = () => {
	let currentLanguage = localStorage.getItem("lng") || LANGUAGES.ENGLISH;
	let translations = null; // to store translations

	const getCurrentLanguage = () => currentLanguage;

	const setLanguage = (lang) => {
		if (!translations[lang]) return; // avoid setting a unsupported language
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
		if (isCellAvailable(row, col)) {
			board[row][col].setValue(char, player);
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

const Opponent = () => {
	// implement minimax algorithm for computer choice.
	// documentation: https://alialaa.com/blog/tic-tac-toe-js-minimax
	let currentDifficulty = "";

	const setDifficulty = (value) => {
		currentDifficulty = value;
	};

	const getDifficulty = () => currentDifficulty;

	const getEmptyCells = (board) => {
		return board.getBoard().flatMap(
			(
				row,
				i // create one level arr
			) =>
				row.flatMap((cell, j) => {
					return cell.getValue().char === "*" ? { row: i, col: j } : [];
				})
		);
	};

	const cloneBoard = (board) => {
		const newBoard = GameBoard();

		board.getBoard().forEach((row, rowIndex) => {
			row.forEach((cell, cellIndex) => {
				const value = cell.getValue();
				newBoard.setCell(rowIndex, cellIndex, value.char, value.playerName);
			});
		});

		return newBoard;
	};

	const minimax = (board, depth, isMaximizing, computerChar, humanChar) => {
		if (board.checkWinner(computerChar)) return 10 - depth; // computer wins
		if (board.checkWinner(humanChar)) return depth - 10; // human wins
		if (board.checkTie()) return 0; // tie

		const emptyCells = getEmptyCells(board);

		if (isMaximizing) {
			let bestScore = -Infinity;
			for (const { row, col } of emptyCells) {
				const newBoard = cloneBoard(board);
				newBoard.setCell(row, col, computerChar, "Computer");
				const score = minimax(newBoard, depth + 1, false, computerChar, humanChar);
				bestScore = Math.max(score, bestScore);
			}
			return bestScore;
		} else {
			let bestScore = Infinity;
			for (const { row, col } of emptyCells) {
				const newBoard = cloneBoard(board);
				newBoard.setCell(row, col, humanChar, "Human");
				const score = minimax(newBoard, depth + 1, true, computerChar, humanChar);
				bestScore = Math.min(score, bestScore);
			}
			return bestScore;
		}
	};

	const getBestMove = (board) => {
		const emptyCells = getEmptyCells(board);
		let bestScore = -Infinity;
		let bestMove = null;

		for (const { row, col } of emptyCells) {
			const newBoard = cloneBoard(board);
			newBoard.setCell(row, col, "O", "Computer");
			const score = minimax(newBoard, 0, false, "O", "X");

			if (score > bestScore) {
				bestScore = score;
				bestMove = { row, col };
			}
		}

		return bestMove;
	};

	const makeRandomMove = (emptyCells) => {
		const randomIndex = Math.floor(Math.random() * emptyCells.length);
		const { row, col } = emptyCells[randomIndex];
		return { row, col };
	};

	const makeMove = (board) => {
		const emptyCells = getEmptyCells(board);
		if (emptyCells.length === 0) return; // no more moves to make

		let move;

		switch (currentDifficulty) {
			case DIFFICULTIES.EASY:
				move = makeRandomMove(emptyCells); // random move
				console.log("easy move", move);
				break;
			case DIFFICULTIES.INTERMEDIATE:
				if (Math.random() < 0.5) {
					move = makeRandomMove(emptyCells);
					console.log("easy move", move);
					break;
				} else {
					move = getBestMove(board);
					console.log("medium move", move);
					break;
				}
			case DIFFICULTIES.HARD:
				if (Math.random() < 0.25) {
					move = makeRandomMove(emptyCells);
					console.log("easy move", move);
					break;
				} else {
					move = getBestMove(board);
					console.log("medium move", move);
					break;
				}
			case DIFFICULTIES.IMPOSSIBLE:
				move = getBestMove(board);
				console.log("medium move", move);
				break;
		}

		return move;
	};

	return { setDifficulty, getDifficulty, getEmptyCells, makeMove, cloneBoard };
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

	const opponent = Opponent();

	opponent.setDifficulty(DIFFICULTIES.EASY);

	const getOpponent = () => opponent;

	const changeNames = (firstPlayerName, secondPlayerName) => {
		players[0].playerName = firstPlayerName;
		players[1].playerName = secondPlayerName;
	};

	const getPlayers = () => players;
	const getPlayersName = () => {
		return players.map((player) => player.playerName);
	};

	const board = GameBoard();

	let activePlayerIndex = 0;
	let gameEnded = false;
	let rounds = 0;
	let winner = null;
	let mode;

	const setMode = (newMode) => {
		mode = newMode;
	};

	const getMode = () => mode;

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

	const resetScore = () => {
		score.playerOne = 0;
		score.playerTwo = 0;
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

	return {
		setMode,
		getMode,
		playRound,
		getPlayersName,
		getPlayers,
		changeNames,
		getActivePlayer,
		resetGame,
		getWinner,
		getScore,
		setScore,
		resetScore,
		getOpponent,
	};
};

const GameUI = () => {
	const game = GameController();
	const board = GameBoard();
	const { PVC, PVP } = MODES;
	const languageManager = LanguageManager();
	const mainTitle = document.querySelector("#main-title");
	const btnSolo = document.querySelector("#btn-solo");
	const btnWithFriend = document.querySelector("#btn-friend");
	const btnRules = document.querySelector("#btn-rules");
	const btnRulesGame = document.querySelector("#btn-rules-game");
	const btnReset = document.querySelector("#reset-game");
	const btnNewGame = document.querySelector("#new-game");
	const btnHome = document.querySelector("#btn-home");
	const btnBack = document.querySelector("#btn-back");
	const rulesTitle = document.querySelector("#rules-title");
	const rulesContent = document.querySelectorAll(".rules-content");
	const settingsSection = document.querySelector("#settings");
	const gameSection = document.querySelector("#game");
	const rulesSection = document.querySelector("#rules");
	const cells = document.querySelectorAll(".cell");
	const playerOneScore = document.querySelector("#player1-score");
	const playerTwoScore = document.querySelector("#player2-score");
	const turn = document.querySelector("#turn");
	const difficultyMode = document.querySelector("#difficulty-mode");
	const selectedFlag = document.getElementById("selected-flag");
	const savedLanguage = localStorage.getItem("lng") || LANGUAGES.ENGLISH;
	const dropdownOptions = document.getElementById("dropdown-options");
	const dropdownSelected = document.querySelector(".dropdown-selected");
	const playerOneNameElement = document.querySelector("#player1-name");
	const playerTwoNameElement = document.querySelector("#player2-name");
	const difficultyDropdown = document.querySelector(".difficulty-dropdown");
	const selectedDifficulty = document.querySelector(".selected-difficulty");
	const difficultyOptions = document.querySelectorAll(".option-diff");

	const setDifficulty = (value) => {
		game.getOpponent().setDifficulty(value);
	};

	const fillBoard = (player, cell) => {
		const row = cell.dataset.row;
		const col = cell.dataset.col;
		board.setCell(row, col, player.char, player.playerName);
		cell.textContent = player.char;
		cell.classList.add(player.char.toLowerCase());
	};

	Object.entries(FLAGS).forEach(([langCode, flagURL]) => {
		selectedFlag.src = FLAGS[savedLanguage];
		const option = document.createElement("div");
		option.classList.add("dropdown-option");

		const img = document.createElement("img");
		img.src = flagURL;
		img.alt = langCode;

		option.appendChild(img);
		option.addEventListener("click", () => {
			selectedFlag.src = flagURL;
			selectedFlag.alt = langCode;
			languageManager.setLanguage(langCode);
			localStorage.setItem("lng", langCode);
			dropdownOptions.style.display = "none";
			updateUI();
		});

		dropdownOptions.appendChild(option);
	});

	const updateDifficultyModeText = async () => {
		const translations = await languageManager.getTranslations();
		const difficultyText = translations.difficulty;
		const currentDifficulty = game.getOpponent().getDifficulty();
		const difficultyModeText = difficultyText[currentDifficulty] || currentDifficulty;
		difficultyMode.textContent = difficultyModeText;
	};

	const updateDifficultyDropDownText = async () => {
		const translations = await languageManager.getTranslations();
		const difficultyText = translations.difficulty;

		difficultyOptions.forEach((option) => {
			const value = option.dataset.difficulty;
			const difficultyModeText = difficultyText[value] || value;
			option.textContent = difficultyModeText;
		});
	};

	const updateText = (data) => {
		const { titles, buttons, difficulty, turn_text, rules, rules_titles, game_rules_header } = data;
		const gameMode = game.getMode();
		updateDifficultyDropDownText();
		selectedDifficulty.textContent = difficulty[game.getOpponent().getDifficulty()];
		mainTitle.textContent = titles.main;
		btnSolo.textContent = buttons.play_solo;
		btnWithFriend.textContent = buttons.play_friend;
		btnRules.textContent = buttons.game_rules;
		btnRulesGame.textContent = buttons.game_rules;
		btnReset.textContent = buttons.reset_game;
		btnNewGame.textContent = buttons.new_game;
		difficultyMode.textContent = gameMode === PVP ? PVP : updateDifficultyModeText();
		turn.textContent = turn_text.player;
		rulesTitle.textContent = game_rules_header;
		rulesContent.forEach((content, index) => {
			const title = content.querySelector(".rules-content-title");
			const paragraph = content.querySelector(".rules-content-paragraph");

			title.textContent = rules_titles[Object.keys(rules_titles)[index]];
			paragraph.textContent = rules[Object.keys(rules)[index]];
		});
	};

	const handlePlayerVsComputer = async () => {
		game.setMode(PVC);
		game.changeNames("Human", "Computer");
		playerOneNameElement.textContent = game.getPlayersName()[0];
		playerTwoNameElement.textContent = game.getPlayersName()[1];
		const data = await languageManager.getTranslations();
		settingsSection.style.display = "none";
		gameSection.style.display = "block";
		updateText(data);
	};

	const handlePlayerVsPlayer = async () => {
		game.setMode(PVP);
		const data = await languageManager.getTranslations();

		const modal = document.querySelector("#modal");
		const btnCancel = document.querySelector("#cancel-btn");
		const btnConfirm = document.querySelector("#confirm-btn");
		const inputOne = document.querySelector("#player-one-name");
		const inputTwo = document.querySelector("#player-two-name");
		let playerOneName = "";
		let playerTwoName = "";

		modal.showModal();

		inputOne.addEventListener("change", (e) => {
			playerOneName = e.target.value;
		});

		inputTwo.addEventListener("change", (e) => {
			playerTwoName = e.target.value;
		});

		btnCancel.addEventListener("click", () => {
			modal.close();
		});

		btnConfirm.addEventListener("click", () => {
			if (playerOneName === "" || playerTwoName === "") {
				alert("Please enter both player names.");
				return;
			}
			game.changeNames(playerOneName, playerTwoName);
			playerOneNameElement.textContent = playerOneName;
			playerTwoNameElement.textContent = playerTwoName;
			modal.close();
			settingsSection.style.display = "none";
			gameSection.style.display = "block";
			updateText(data);
		});
	};

	const updateUI = async () => {
		const data = await languageManager.getTranslations();
		updateText(data);
	};

	const updateScore = (winner) => {
		game.setScore(winner);
		playerOneScore.textContent = game.getScore().playerOne;
		playerTwoScore.textContent = game.getScore().playerTwo;
	};

	const checkIfGameIsWon = () => !!game.getWinner();

	const fillWinningPattern = (activePlayer) => {
		const cssClass = activePlayer.char === "X" ? "filled-x" : "filled-o";
		const winningPattern = board
			.generateWinPatterns()
			.find((pattern) => pattern.every(([row, col]) => board.getBoard()[row][col].getValue().char === activePlayer.char));

		if (winningPattern) {
			winningPattern.forEach(([row, col]) => {
				const winningCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
				if (winningCell) {
					winningCell.classList.add(cssClass);
				}
			});
		}
	};

	const handleTurnMessage = async (activePlayer) => {
		const [playerOneName, playerTwoName] = game.getPlayersName();
		const translations = await languageManager.getTranslations();
		const turn_text = translations.turn_text;
		const gameMode = game.getMode();

		if (activePlayer.playerName === playerOneName) {
			turn.textContent = gameMode === PVC ? turn_text.player : playerOneName;
		} else if (activePlayer.playerName === playerTwoName) {
			turn.textContent = gameMode === PVC ? turn_text.opponent : playerTwoName;
		}
	};

	const handleWin = async (activePlayer) => {
		const translations = await languageManager.getTranslations();
		const text = translations.game_over;
		const winner = game.getWinner();
		fillWinningPattern(activePlayer);
		updateScore(winner);
		turn.textContent = winner === game.getPlayersName()[0] ? text.win : text.defeat;
		btnReset.setAttribute("disabled", true);
		setTimeout(() => {
			btnReset.removeAttribute("disabled");
			btnReset.click();
		}, 2000);
	};

	const handleTie = async () => {
		const translations = await languageManager.getTranslations();
		const text = translations.game_over;
		turn.textContent = text.draw;
		btnReset.setAttribute("disabled", true);
		setTimeout(() => {
			btnReset.removeAttribute("disabled");
			btnReset.click();
		}, 2000);
		return;
	};

	const handleComputerChange = async (computer) => {
		const move = game.getOpponent().makeMove(board);
		if (move) {
			const { row, col } = move;
			game.playRound(row, col);
			const cellToFill = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
			fillBoard(computer, cellToFill);

			await handleTurnMessage(game.getActivePlayer());

			setTimeout(() => {
				if (checkIfGameIsWon()) {
					handleWin(computer);
					return;
				}
				if (board.checkTie()) {
					handleTie();
					return;
				}
			}, 300);
		}
	};

	const handleEvents = (() => {
		const svgArrow = document.querySelector(".svg-arrow");
		dropdownSelected.addEventListener("click", () => {
			dropdownOptions.style.display = dropdownOptions.style.display === "block" ? "none" : "block";
		});
		document.addEventListener("click", (event) => {
			if (!dropdownSelected.contains(event.target) && !dropdownOptions.contains(event.target)) {
				dropdownOptions.style.display = "none";
			}
		});
		selectedDifficulty.addEventListener("click", () => {
			difficultyDropdown.classList.toggle("open");
			const isOpen = difficultyDropdown.classList.contains("open");
			svgArrow.classList.toggle("rotate-arrow", isOpen);
		});
		difficultyOptions.forEach((option) => {
			option.addEventListener("click", () => {
				const value = option.dataset.difficulty;
				selectedDifficulty.textContent = option.textContent;
				difficultyDropdown.classList.remove("open");
				svgArrow.classList.remove("rotate-arrow");
				setDifficulty(value);
			});
		});
		document.addEventListener("click", (e) => {
			if (!difficultyDropdown.contains(e.target)) {
				difficultyDropdown.classList.remove("open");
				svgArrow.classList.remove("rotate-arrow");
			}
		});
		btnSolo.addEventListener("click", async () => {
			handlePlayerVsComputer();
		});
		btnWithFriend.addEventListener("click", () => {
			handlePlayerVsPlayer();
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
		btnNewGame.addEventListener("click", () => {
			btnReset.click();
			game.resetScore();
			playerOneScore.textContent = game.getScore().playerOne;
			playerTwoScore.textContent = game.getScore().playerTwo;
		});
		btnReset.addEventListener("click", async () => {
			const translations = await languageManager.getTranslations();
			const text = translations.turn_text.player;
			board.resetBoard();
			game.resetGame();
			turn.textContent = text;
			cells.forEach((cell) => {
				cell.textContent = "";
				cell.classList.remove("filled-x");
				cell.classList.remove("filled-o");
				cell.classList.remove("x");
				cell.classList.remove("o");
			});
		});
	})();

	const handlePlayerCheck = (() => {
		const isCellAvailable = (cell) => cell.textContent === "" && !game.getWinner();

		document.addEventListener("click", async (e) => {
			if (!e.target.classList.contains("cell")) return;

			const cell = e.target;
			if (!isCellAvailable(cell)) return;

			const row = cell.dataset.row;
			const col = cell.dataset.col;

			const activePlayer = game.getActivePlayer();
			game.playRound(row, col);
			fillBoard(activePlayer, cell);

			const nextPlayer = game.getActivePlayer();
			await handleTurnMessage(nextPlayer);

			setTimeout(() => {
				if (checkIfGameIsWon()) {
					handleWin(activePlayer);
					return;
				}

				if (board.checkTie()) {
					handleTie();
					return;
				}

				if (nextPlayer.playerName === "Computer") {
					handleComputerChange(nextPlayer);
				}
			}, 300);
		});
	})();

	return { updateUI };
};

const gameUI = GameUI();
gameUI.updateUI();
