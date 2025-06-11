const readline = require('readline');

// Game constants
const BOARD_SIZE = 10;
const NUM_SHIPS = 3;
const SHIP_LENGTH = 3;
const CELL_WATER = '~';
const CELL_SHIP = 'S';
const CELL_HIT = 'X';
const CELL_MISS = 'O';

/**
 * Represents a single ship in the game
 */
class Ship {
  constructor() {
    this.locations = [];
    this.hits = [];
  }

  /**
   * Adds a location to the ship
   * @param {string} location - The location string (e.g., "23")
   */
  addLocation(location) {
    this.locations.push(location);
    this.hits.push('');
  }

  /**
   * Registers a hit on the ship
   * @param {string} location - The location that was hit
   * @returns {boolean} - True if the location was part of this ship
   */
  hit(location) {
    const index = this.locations.indexOf(location);
    if (index >= 0 && this.hits[index] !== 'hit') {
      this.hits[index] = 'hit';
      return true;
    }
    return false;
  }

  /**
   * Checks if the ship is completely sunk
   * @returns {boolean}
   */
  isSunk() {
    return this.hits.every(hit => hit === 'hit');
  }

  /**
   * Checks if a location is part of this ship
   * @param {string} location
   * @returns {boolean}
   */
  hasLocation(location) {
    return this.locations.includes(location);
  }
}

/**
 * Manages the game board state and display
 */
class Board {
  constructor() {
    this.grid = this.createGrid();
  }

  /**
   * Creates an empty grid
   * @returns {string[][]}
   */
  createGrid() {
    return Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill(CELL_WATER)
    );
  }

  /**
   * Places a ship on the board
   * @param {Ship} ship
   * @param {boolean} showShip - Whether to display the ship on the board
   */
  placeShip(ship, showShip = false) {
    ship.locations.forEach(location => {
      const { row, col } = this.parseLocation(location);
      if (showShip) {
        this.grid[row][col] = CELL_SHIP;
      }
    });
  }

  /**
   * Marks a hit or miss on the board
   * @param {number} row
   * @param {number} col
   * @param {boolean} isHit
   */
  markGuess(row, col, isHit) {
    this.grid[row][col] = isHit ? CELL_HIT : CELL_MISS;
  }

  /**
   * Parses a location string into row and column
   * @param {string} location
   * @returns {{row: number, col: number}}
   */
  parseLocation(location) {
    return {
      row: parseInt(location[0]),
      col: parseInt(location[1])
    };
  }

  /**
   * Formats row and column into location string
   * @param {number} row
   * @param {number} col
   * @returns {string}
   */
  formatLocation(row, col) {
    return `${row}${col}`;
  }

  /**
   * Checks if coordinates are valid
   * @param {number} row
   * @param {number} col
   * @returns {boolean}
   */
  isValidCoordinate(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }
}

/**
 * Base class for players
 */
class Player {
  constructor(name) {
    this.name = name;
    this.ships = [];
    this.numShips = NUM_SHIPS;
    this.guesses = [];
    this.board = new Board();
  }

  /**
   * Places ships randomly on the player's board
   */
  placeShipsRandomly() {
    let placedShips = 0;
    
    while (placedShips < NUM_SHIPS) {
      const ship = this.generateRandomShip();
      if (ship) {
        this.ships.push(ship);
        this.board.placeShip(ship, true);
        placedShips++;
      }
    }
  }

  /**
   * Generates a random ship placement
   * @returns {Ship|null}
   */
  generateRandomShip() {
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const maxStartRow = orientation === 'vertical' ? BOARD_SIZE - SHIP_LENGTH : BOARD_SIZE - 1;
    const maxStartCol = orientation === 'horizontal' ? BOARD_SIZE - SHIP_LENGTH : BOARD_SIZE - 1;
    
    const startRow = Math.floor(Math.random() * (maxStartRow + 1));
    const startCol = Math.floor(Math.random() * (maxStartCol + 1));

    // Check for collisions
    const locations = [];
    for (let i = 0; i < SHIP_LENGTH; i++) {
      const row = orientation === 'vertical' ? startRow + i : startRow;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      const location = this.board.formatLocation(row, col);
      
      if (this.board.grid[row][col] !== CELL_WATER) {
        return null; // Collision detected
      }
      locations.push(location);
    }

    // Create ship
    const ship = new Ship();
    locations.forEach(location => ship.addLocation(location));
    return ship;
  }

  /**
   * Processes a guess against this player's ships
   * @param {string} guess
   * @returns {{hit: boolean, sunk: boolean}}
   */
  receiveGuess(guess) {
    const { row, col } = this.board.parseLocation(guess);
    
    for (const ship of this.ships) {
      if (ship.hit(guess)) {
        this.board.markGuess(row, col, true);
        if (ship.isSunk()) {
          this.numShips--;
          return { hit: true, sunk: true };
        }
        return { hit: true, sunk: false };
      }
    }
    
    this.board.markGuess(row, col, false);
    return { hit: false, sunk: false };
  }

  /**
   * Checks if this player has any ships remaining
   * @returns {boolean}
   */
  hasShipsRemaining() {
    return this.numShips > 0;
  }
}

/**
 * CPU player with AI logic
 */
class CPUPlayer extends Player {
  constructor() {
    super('CPU');
    this.mode = 'hunt';
    this.targetQueue = [];
  }

  /**
   * Makes a guess using AI logic
   * @param {string[]} previousGuesses
   * @returns {string}
   */
  makeGuess(previousGuesses) {
    let guess;

    if (this.mode === 'target' && this.targetQueue.length > 0) {
      // Target mode: attack adjacent cells
      do {
        guess = this.targetQueue.shift();
        if (this.targetQueue.length === 0) {
          this.mode = 'hunt';
        }
      } while (guess && previousGuesses.includes(guess));
    }

    if (!guess || previousGuesses.includes(guess)) {
      // Hunt mode: random guessing
      this.mode = 'hunt';
      do {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        guess = this.board.formatLocation(row, col);
      } while (previousGuesses.includes(guess));
    }

    return guess;
  }

  /**
   * Processes the result of a guess to update AI state
   * @param {string} guess
   * @param {boolean} wasHit
   * @param {boolean} wasSunk
   */
  processGuessResult(guess, wasHit, wasSunk) {
    if (wasHit) {
      if (wasSunk) {
        this.mode = 'hunt';
        this.targetQueue = [];
      } else {
        this.mode = 'target';
        this.addAdjacentTargets(guess);
      }
    }
  }

  /**
   * Adds adjacent cells to the target queue
   * @param {string} hitLocation
   */
  addAdjacentTargets(hitLocation) {
    const { row, col } = this.board.parseLocation(hitLocation);
    const adjacent = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 }
    ];

    adjacent.forEach(({ r, c }) => {
      if (this.board.isValidCoordinate(r, c)) {
        const adjLocation = this.board.formatLocation(r, c);
        if (!this.targetQueue.includes(adjLocation)) {
          this.targetQueue.push(adjLocation);
        }
      }
    });
  }
}

/**
 * Main game controller
 */
class SeaBattleGame {
  constructor() {
    this.player = new Player('Player');
    this.cpu = new CPUPlayer();
    this.opponentBoard = new Board(); // Board showing player's guesses against CPU
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Initializes the game
   */
  async init() {
    console.log('Boards created.');
    
    this.player.placeShipsRandomly();
    this.cpu.placeShipsRandomly();
    
    console.log(`${NUM_SHIPS} ships placed randomly for Player.`);
    console.log(`${NUM_SHIPS} ships placed randomly for CPU.`);
    
    console.log(`\nLet's play Sea Battle!`);
    console.log(`Try to sink the ${NUM_SHIPS} enemy ships.`);
    
    await this.gameLoop();
  }

  /**
   * Main game loop
   */
  async gameLoop() {
    while (this.player.hasShipsRemaining() && this.cpu.hasShipsRemaining()) {
      this.displayBoards();
      
      const playerGuess = await this.getPlayerGuess();
      if (!playerGuess) continue;
      
      const result = this.cpu.receiveGuess(playerGuess);
      this.processPlayerGuess(playerGuess, result);
      
      if (!this.cpu.hasShipsRemaining()) break;
      
      this.cpuTurn();
    }
    
    this.endGame();
  }

  /**
   * Gets a valid guess from the player
   * @returns {Promise<string|null>}
   */
  getPlayerGuess() {
    return new Promise((resolve) => {
      this.rl.question('Enter your guess (e.g., 00): ', (answer) => {
        const validatedGuess = this.validatePlayerGuess(answer);
        resolve(validatedGuess);
      });
    });
  }

  /**
   * Validates player input
   * @param {string} guess
   * @returns {string|null}
   */
  validatePlayerGuess(guess) {
    if (!guess || guess.length !== 2) {
      console.log('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
      return null;
    }

    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    if (isNaN(row) || isNaN(col) || !this.opponentBoard.isValidCoordinate(row, col)) {
      console.log(`Oops, please enter valid row and column numbers between 0 and ${BOARD_SIZE - 1}.`);
      return null;
    }

    if (this.player.guesses.includes(guess)) {
      console.log('You already guessed that location!');
      return null;
    }

    return guess;
  }

  /**
   * Processes the result of a player's guess
   * @param {string} guess
   * @param {{hit: boolean, sunk: boolean}} result
   */
  processPlayerGuess(guess, { hit, sunk }) {
    this.player.guesses.push(guess);
    const { row, col } = this.opponentBoard.parseLocation(guess);
    this.opponentBoard.markGuess(row, col, hit);

    if (hit) {
      console.log('PLAYER HIT!');
      if (sunk) {
        console.log('You sunk an enemy battleship!');
      }
    } else {
      console.log('PLAYER MISS.');
    }
  }

  /**
   * Executes the CPU's turn
   */
  cpuTurn() {
    console.log("\n--- CPU's Turn ---");
    
    const guess = this.cpu.makeGuess(this.cpu.guesses);
    this.cpu.guesses.push(guess);
    
    console.log(`CPU targets: ${guess}`);
    
    const result = this.player.receiveGuess(guess);
    this.cpu.processGuessResult(guess, result.hit, result.sunk);
    
    if (result.hit) {
      console.log(`CPU HIT at ${guess}!`);
      if (result.sunk) {
        console.log('CPU sunk your battleship!');
      }
    } else {
      console.log(`CPU MISS at ${guess}.`);
    }
  }

  /**
   * Displays both game boards
   */
  displayBoards() {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    const header = '  ' + Array.from({ length: BOARD_SIZE }, (_, i) => i).join(' ');
    console.log(`${header}     ${header}`);

    for (let i = 0; i < BOARD_SIZE; i++) {
      const opponentRow = `${i} ${this.opponentBoard.grid[i].join(' ')}`;
      const playerRow = `${i} ${this.player.board.grid[i].join(' ')}`;
      console.log(`${opponentRow}    ${playerRow}`);
    }
    console.log();
  }

  /**
   * Ends the game and displays the result
   */
  endGame() {
    if (!this.cpu.hasShipsRemaining()) {
      console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
    } else {
      console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
    }
    
    this.displayBoards();
    this.rl.close();
  }
}

// Start the game only when run directly (not when imported for testing)
if (require.main === module) {
  const game = new SeaBattleGame();
  game.init().catch(console.error);
}

// Export classes for testing
module.exports = {
  Ship,
  Board,
  Player,
  CPUPlayer,
  SeaBattleGame,
  BOARD_SIZE,
  NUM_SHIPS,
  SHIP_LENGTH,
  CELL_WATER,
  CELL_SHIP,
  CELL_HIT,
  CELL_MISS
};
