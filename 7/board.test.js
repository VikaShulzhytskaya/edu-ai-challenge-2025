const { Board, Ship, BOARD_SIZE, CELL_WATER, CELL_SHIP, CELL_HIT, CELL_MISS } = require('./seabattle.js');

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board();
  });

  describe('constructor', () => {
    test('should create a board with correct dimensions', () => {
      expect(board.grid).toHaveLength(BOARD_SIZE);
      expect(board.grid[0]).toHaveLength(BOARD_SIZE);
    });

    test('should initialize all cells with water', () => {
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          expect(board.grid[i][j]).toBe(CELL_WATER);
        }
      }
    });
  });

  describe('createGrid', () => {
    test('should create a grid with correct dimensions', () => {
      const grid = board.createGrid();
      
      expect(grid).toHaveLength(BOARD_SIZE);
      expect(grid[0]).toHaveLength(BOARD_SIZE);
    });

    test('should fill grid with water cells', () => {
      const grid = board.createGrid();
      
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          expect(grid[i][j]).toBe(CELL_WATER);
        }
      }
    });
  });

  describe('placeShip', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship();
      ship.addLocation('23');
      ship.addLocation('24');
      ship.addLocation('25');
    });

    test('should place ship on board when showShip is true', () => {
      board.placeShip(ship, true);
      
      expect(board.grid[2][3]).toBe(CELL_SHIP);
      expect(board.grid[2][4]).toBe(CELL_SHIP);
      expect(board.grid[2][5]).toBe(CELL_SHIP);
    });

    test('should not show ship on board when showShip is false', () => {
      board.placeShip(ship, false);
      
      expect(board.grid[2][3]).toBe(CELL_WATER);
      expect(board.grid[2][4]).toBe(CELL_WATER);
      expect(board.grid[2][5]).toBe(CELL_WATER);
    });

    test('should use default showShip value of false', () => {
      board.placeShip(ship);
      
      expect(board.grid[2][3]).toBe(CELL_WATER);
      expect(board.grid[2][4]).toBe(CELL_WATER);
      expect(board.grid[2][5]).toBe(CELL_WATER);
    });

    test('should handle single location ship', () => {
      const singleShip = new Ship();
      singleShip.addLocation('00');
      
      board.placeShip(singleShip, true);
      
      expect(board.grid[0][0]).toBe(CELL_SHIP);
    });
  });

  describe('markGuess', () => {
    test('should mark hit correctly', () => {
      board.markGuess(3, 4, true);
      
      expect(board.grid[3][4]).toBe(CELL_HIT);
    });

    test('should mark miss correctly', () => {
      board.markGuess(3, 4, false);
      
      expect(board.grid[3][4]).toBe(CELL_MISS);
    });

    test('should handle corner positions', () => {
      board.markGuess(0, 0, true);
      board.markGuess(9, 9, false);
      
      expect(board.grid[0][0]).toBe(CELL_HIT);
      expect(board.grid[9][9]).toBe(CELL_MISS);
    });
  });

  describe('parseLocation', () => {
    test('should parse valid location correctly', () => {
      const result = board.parseLocation('34');
      
      expect(result).toEqual({ row: 3, col: 4 });
    });

    test('should parse corner locations correctly', () => {
      expect(board.parseLocation('00')).toEqual({ row: 0, col: 0 });
      expect(board.parseLocation('99')).toEqual({ row: 9, col: 9 });
    });

    test('should handle single digit parsing', () => {
      expect(board.parseLocation('01')).toEqual({ row: 0, col: 1 });
      expect(board.parseLocation('10')).toEqual({ row: 1, col: 0 });
    });
  });

  describe('formatLocation', () => {
    test('should format location correctly', () => {
      const result = board.formatLocation(3, 4);
      
      expect(result).toBe('34');
    });

    test('should format corner locations correctly', () => {
      expect(board.formatLocation(0, 0)).toBe('00');
      expect(board.formatLocation(9, 9)).toBe('99');
    });

    test('should format single digits correctly', () => {
      expect(board.formatLocation(0, 1)).toBe('01');
      expect(board.formatLocation(1, 0)).toBe('10');
    });
  });

  describe('isValidCoordinate', () => {
    test('should return true for valid coordinates', () => {
      expect(board.isValidCoordinate(5, 5)).toBe(true);
      expect(board.isValidCoordinate(0, 0)).toBe(true);
      expect(board.isValidCoordinate(9, 9)).toBe(true);
    });

    test('should return false for negative coordinates', () => {
      expect(board.isValidCoordinate(-1, 5)).toBe(false);
      expect(board.isValidCoordinate(5, -1)).toBe(false);
      expect(board.isValidCoordinate(-1, -1)).toBe(false);
    });

    test('should return false for coordinates >= BOARD_SIZE', () => {
      expect(board.isValidCoordinate(10, 5)).toBe(false);
      expect(board.isValidCoordinate(5, 10)).toBe(false);
      expect(board.isValidCoordinate(10, 10)).toBe(false);
    });

    test('should return false for coordinates at boundary', () => {
      expect(board.isValidCoordinate(BOARD_SIZE, 0)).toBe(false);
      expect(board.isValidCoordinate(0, BOARD_SIZE)).toBe(false);
    });

    test('should return true for edge coordinates', () => {
      expect(board.isValidCoordinate(BOARD_SIZE - 1, 0)).toBe(true);
      expect(board.isValidCoordinate(0, BOARD_SIZE - 1)).toBe(true);
      expect(board.isValidCoordinate(BOARD_SIZE - 1, BOARD_SIZE - 1)).toBe(true);
    });
  });

  describe('integration tests', () => {
    test('should correctly parse and format the same location', () => {
      const original = '34';
      const parsed = board.parseLocation(original);
      const formatted = board.formatLocation(parsed.row, parsed.col);
      
      expect(formatted).toBe(original);
    });

    test('should handle complete ship placement workflow', () => {
      const ship = new Ship();
      ship.addLocation('23');
      ship.addLocation('33');
      ship.addLocation('43');
      
      board.placeShip(ship, true);
      
      expect(board.grid[2][3]).toBe(CELL_SHIP);
      expect(board.grid[3][3]).toBe(CELL_SHIP);
      expect(board.grid[4][3]).toBe(CELL_SHIP);
      
      // Other cells should remain water
      expect(board.grid[1][3]).toBe(CELL_WATER);
      expect(board.grid[5][3]).toBe(CELL_WATER);
      expect(board.grid[2][2]).toBe(CELL_WATER);
      expect(board.grid[2][4]).toBe(CELL_WATER);
    });
  });
}); 