const { SeaBattleGame, BOARD_SIZE } = require('./seabattle.js');

// Mock readline to avoid actual input/output during tests
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn()
  }))
}));

describe('SeaBattleGame', () => {
  let game;

  beforeEach(() => {
    game = new SeaBattleGame();
    // Suppress console output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    test('should initialize game with correct components', () => {
      expect(game.player).toBeDefined();
      expect(game.cpu).toBeDefined();
      expect(game.opponentBoard).toBeDefined();
      expect(game.rl).toBeDefined();
      
      expect(game.player.name).toBe('Player');
      expect(game.cpu.name).toBe('CPU');
    });

    test('should create separate board instances', () => {
      expect(game.player.board).not.toBe(game.cpu.board);
      expect(game.player.board).not.toBe(game.opponentBoard);
      expect(game.cpu.board).not.toBe(game.opponentBoard);
    });
  });

  describe('validatePlayerGuess', () => {
    test('should accept valid two-digit input', () => {
      const validInputs = ['00', '12', '34', '56', '78', '99'];
      
      validInputs.forEach(input => {
        const result = game.validatePlayerGuess(input);
        expect(result).toBe(input);
      });
    });

    test('should reject null or undefined input', () => {
      expect(game.validatePlayerGuess(null)).toBeNull();
      expect(game.validatePlayerGuess(undefined)).toBeNull();
      expect(game.validatePlayerGuess('')).toBeNull();
    });

    test('should reject input with wrong length', () => {
      const invalidInputs = ['1', '123', '1234', 'a', 'abc'];
      
      invalidInputs.forEach(input => {
        const result = game.validatePlayerGuess(input);
        expect(result).toBeNull();
      });
    });

    test('should reject non-numeric input', () => {
      const invalidInputs = ['ab', 'xy', '1a', 'a1', '--', '++'];
      
      invalidInputs.forEach(input => {
        const result = game.validatePlayerGuess(input);
        expect(result).toBeNull();
      });
    });

    test('should reject coordinates outside board boundaries', () => {
      const invalidInputs = ['-1', '1-', 'aa', `${BOARD_SIZE}0`, `0${BOARD_SIZE}`, `${BOARD_SIZE}${BOARD_SIZE}`];
      
      invalidInputs.forEach(input => {
        const result = game.validatePlayerGuess(input);
        expect(result).toBeNull();
      });
    });

    test('should reject already guessed coordinates', () => {
      game.player.guesses = ['12', '34', '56'];
      
      expect(game.validatePlayerGuess('12')).toBeNull();
      expect(game.validatePlayerGuess('34')).toBeNull();
      expect(game.validatePlayerGuess('56')).toBeNull();
    });

    test('should accept coordinates not yet guessed', () => {
      game.player.guesses = ['12', '34', '56'];
      
      expect(game.validatePlayerGuess('78')).toBe('78');
      expect(game.validatePlayerGuess('90')).toBe('90');
    });

    test('should handle edge cases for board boundaries', () => {
      expect(game.validatePlayerGuess('00')).toBe('00');
      expect(game.validatePlayerGuess('09')).toBe('09');
      expect(game.validatePlayerGuess('90')).toBe('90');
      expect(game.validatePlayerGuess('99')).toBe('99');
    });
  });

  describe('processPlayerGuess', () => {
    beforeEach(() => {
      // Set up a mock ship for the CPU to test against
      const mockShip = {
        addLocation: jest.fn(),
        hit: jest.fn(),
        isSunk: jest.fn(),
        hasLocation: jest.fn(),
        locations: ['23', '24', '25'],
        hits: ['', '', '']
      };
      game.cpu.ships = [mockShip];
    });

    test('should add guess to player guesses list', () => {
      game.processPlayerGuess('12', { hit: false, sunk: false });
      
      expect(game.player.guesses).toContain('12');
    });

    test('should mark hit on opponent board correctly', () => {
      game.processPlayerGuess('23', { hit: true, sunk: false });
      
      expect(game.opponentBoard.grid[2][3]).toBe('X');
    });

    test('should mark miss on opponent board correctly', () => {
      game.processPlayerGuess('12', { hit: false, sunk: false });
      
      expect(game.opponentBoard.grid[1][2]).toBe('O');
    });

    test('should log correct messages for hit', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      game.processPlayerGuess('23', { hit: true, sunk: false });
      
      expect(consoleSpy).toHaveBeenCalledWith('PLAYER HIT!');
    });

    test('should log correct messages for sunk ship', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      game.processPlayerGuess('23', { hit: true, sunk: true });
      
      expect(consoleSpy).toHaveBeenCalledWith('PLAYER HIT!');
      expect(consoleSpy).toHaveBeenCalledWith('You sunk an enemy battleship!');
    });

    test('should log correct messages for miss', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      game.processPlayerGuess('12', { hit: false, sunk: false });
      
      expect(consoleSpy).toHaveBeenCalledWith('PLAYER MISS.');
    });

    test('should handle multiple guesses correctly', () => {
      game.processPlayerGuess('12', { hit: false, sunk: false });
      game.processPlayerGuess('23', { hit: true, sunk: false });
      game.processPlayerGuess('34', { hit: true, sunk: true });
      
      expect(game.player.guesses).toEqual(['12', '23', '34']);
      expect(game.opponentBoard.grid[1][2]).toBe('O');
      expect(game.opponentBoard.grid[2][3]).toBe('X');
      expect(game.opponentBoard.grid[3][4]).toBe('X');
    });
  });

  describe('cpuTurn', () => {
    beforeEach(() => {
      // Set up a mock ship for the player
      const mockShip = {
        addLocation: jest.fn(),
        hit: jest.fn(() => true),
        isSunk: jest.fn(() => false),
        hasLocation: jest.fn(),
        locations: ['45', '46', '47'],
        hits: ['', '', '']
      };
      game.player.ships = [mockShip];
      
      // Mock CPU guess generation
      jest.spyOn(game.cpu, 'makeGuess').mockReturnValue('45');
      jest.spyOn(game.cpu, 'processGuessResult').mockImplementation(() => {});
    });

    test('should add CPU guess to its guesses list', () => {
      game.cpuTurn();
      
      expect(game.cpu.guesses).toContain('45');
    });

    test('should call CPU makeGuess method', () => {
      game.cpuTurn();
      
      expect(game.cpu.makeGuess).toHaveBeenCalledWith(game.cpu.guesses);
    });

    test('should call CPU processGuessResult method', () => {
      game.cpuTurn();
      
      expect(game.cpu.processGuessResult).toHaveBeenCalled();
    });

    test('should log CPU turn start message', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      game.cpuTurn();
      
      expect(consoleSpy).toHaveBeenCalledWith("\n--- CPU's Turn ---");
    });

    test('should log CPU target message', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      game.cpuTurn();
      
      expect(consoleSpy).toHaveBeenCalledWith('CPU targets: 45');
    });
  });

  describe('endGame', () => {
    test('should log victory message when CPU has no ships', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      game.cpu.numShips = 0;
      game.player.numShips = 1;
      
      game.endGame();
      
      expect(consoleSpy).toHaveBeenCalledWith('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
    });

    test('should log defeat message when player has no ships', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      game.cpu.numShips = 1;
      game.player.numShips = 0;
      
      game.endGame();
      
      expect(consoleSpy).toHaveBeenCalledWith('\n*** GAME OVER! The CPU sunk all your battleships! ***');
    });

    test('should close readline interface', () => {
      const closeSpy = jest.spyOn(game.rl, 'close');
      
      game.endGame();
      
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('displayBoards', () => {
    test('should log board headers', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      game.displayBoards();
      
      expect(consoleSpy).toHaveBeenCalledWith('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    });

    test('should log column headers', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      game.displayBoards();
      
      const expectedHeader = '  0 1 2 3 4 5 6 7 8 9       0 1 2 3 4 5 6 7 8 9';
      expect(consoleSpy).toHaveBeenCalledWith(expectedHeader);
    });

    test('should log all board rows', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      game.displayBoards();
      
      // Should log 10 rows (one for each board row) plus headers and separator
      const logCalls = consoleSpy.mock.calls.length;
      expect(logCalls).toBeGreaterThanOrEqual(12); // Headers + 10 rows + separator
    });
  });

  describe('integration tests', () => {
    test('should handle complete guess validation and processing workflow', () => {
      // Start with clean slate
      expect(game.player.guesses).toHaveLength(0);
      
      // Valid guess should be processed
      const validGuess = game.validatePlayerGuess('12');
      expect(validGuess).toBe('12');
      
      if (validGuess) {
        game.processPlayerGuess(validGuess, { hit: false, sunk: false });
        expect(game.player.guesses).toContain('12');
        expect(game.opponentBoard.grid[1][2]).toBe('O');
      }
      
      // Same guess should now be rejected
      const duplicateGuess = game.validatePlayerGuess('12');
      expect(duplicateGuess).toBeNull();
    });

    test('should maintain game state consistency during CPU turn', () => {
      const initialCpuGuesses = game.cpu.guesses.length;
      
      // Mock a successful CPU turn
      jest.spyOn(game.cpu, 'makeGuess').mockReturnValue('34');
      jest.spyOn(game.player, 'receiveGuess').mockReturnValue({ hit: true, sunk: false });
      
      game.cpuTurn();
      
      expect(game.cpu.guesses).toHaveLength(initialCpuGuesses + 1);
      expect(game.cpu.guesses).toContain('34');
    });

    test('should correctly determine game end conditions', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      // Test player victory
      game.cpu.numShips = 0;
      game.player.numShips = 2;
      game.endGame();
      expect(consoleSpy).toHaveBeenCalledWith('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
      
      // Reset and test CPU victory
      consoleSpy.mockClear();
      game.cpu.numShips = 1;
      game.player.numShips = 0;
      game.endGame();
      expect(consoleSpy).toHaveBeenCalledWith('\n*** GAME OVER! The CPU sunk all your battleships! ***');
    });
  });
}); 