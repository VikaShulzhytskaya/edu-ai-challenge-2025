const { Player, Ship, NUM_SHIPS, SHIP_LENGTH, CELL_WATER } = require('./seabattle.js');

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player('TestPlayer');
  });

  describe('constructor', () => {
    test('should initialize player with correct properties', () => {
      expect(player.name).toBe('TestPlayer');
      expect(player.ships).toEqual([]);
      expect(player.numShips).toBe(NUM_SHIPS);
      expect(player.guesses).toEqual([]);
      expect(player.board).toBeDefined();
      expect(player.board.grid).toBeDefined();
    });

    test('should create a new board instance', () => {
      expect(player.board.grid).toHaveLength(10);
      expect(player.board.grid[0]).toHaveLength(10);
    });
  });

  describe('receiveGuess', () => {
    beforeEach(() => {
      // Set up a ship manually for consistent testing
      const ship = new Ship();
      ship.addLocation('23');
      ship.addLocation('24');
      ship.addLocation('25');
      player.ships.push(ship);
      player.board.placeShip(ship, true);
    });

    test('should return hit=true and sunk=false for valid hit on unsunk ship', () => {
      const result = player.receiveGuess('23');
      
      expect(result).toEqual({ hit: true, sunk: false });
      expect(player.board.grid[2][3]).toBe('X'); // Should mark as hit
    });

    test('should return hit=false for miss', () => {
      const result = player.receiveGuess('00');
      
      expect(result).toEqual({ hit: false, sunk: false });
      expect(player.board.grid[0][0]).toBe('O'); // Should mark as miss
    });

    test('should return hit=true and sunk=true when ship is sunk', () => {
      // Hit all parts of the ship except the last one
      player.receiveGuess('23');
      player.receiveGuess('24');
      
      // Hit the last part
      const result = player.receiveGuess('25');
      
      expect(result).toEqual({ hit: true, sunk: true });
      expect(player.numShips).toBe(NUM_SHIPS - 1);
    });

    test('should handle multiple ships correctly', () => {
      // Add another ship
      const ship2 = new Ship();
      ship2.addLocation('45');
      ship2.addLocation('46');
      ship2.addLocation('47');
      player.ships.push(ship2);
      player.board.placeShip(ship2, true);
      
      // Hit first ship completely
      player.receiveGuess('23');
      player.receiveGuess('24');
      const result1 = player.receiveGuess('25');
      
      expect(result1).toEqual({ hit: true, sunk: true });
      expect(player.numShips).toBe(NUM_SHIPS - 1);
      
      // Hit second ship partially
      const result2 = player.receiveGuess('45');
      
      expect(result2).toEqual({ hit: true, sunk: false });
      expect(player.numShips).toBe(NUM_SHIPS - 1); // Still one ship remaining
    });

    test('should handle edge coordinates', () => {
      const edgeShip = new Ship();
      edgeShip.addLocation('00');
      edgeShip.addLocation('01');
      edgeShip.addLocation('02');
      player.ships.push(edgeShip);
      player.board.placeShip(edgeShip, true);
      
      const result = player.receiveGuess('00');
      
      expect(result).toEqual({ hit: true, sunk: false });
      expect(player.board.grid[0][0]).toBe('X');
    });
  });

  describe('hasShipsRemaining', () => {
    test('should return true when ships remain', () => {
      expect(player.hasShipsRemaining()).toBe(true);
    });

    test('should return false when no ships remain', () => {
      player.numShips = 0;
      
      expect(player.hasShipsRemaining()).toBe(false);
    });

    test('should return true for any positive number of ships', () => {
      player.numShips = 1;
      expect(player.hasShipsRemaining()).toBe(true);
      
      player.numShips = 5;
      expect(player.hasShipsRemaining()).toBe(true);
    });
  });

  describe('generateRandomShip', () => {
    test('should generate a ship with correct length', () => {
      const ship = player.generateRandomShip();
      
      if (ship) { // Ship generation might fail due to collisions
        expect(ship.locations).toHaveLength(SHIP_LENGTH);
      }
    });

    test('should generate ships within board boundaries', () => {
      // Try multiple times to account for randomness
      for (let attempt = 0; attempt < 50; attempt++) {
        const ship = player.generateRandomShip();
        
        if (ship) {
          ship.locations.forEach(location => {
            const { row, col } = player.board.parseLocation(location);
            expect(row).toBeGreaterThanOrEqual(0);
            expect(row).toBeLessThan(10);
            expect(col).toBeGreaterThanOrEqual(0);
            expect(col).toBeLessThan(10);
          });
          break; // Successfully generated and tested one ship
        }
      }
    });

    test('should return null when collision detected', () => {
      // Fill a section of the board to force collision
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          player.board.grid[i][j] = 'S';
        }
      }
      
      const ship = player.generateRandomShip();
      
      expect(ship).toBeNull();
    });

    test('should generate horizontal or vertical ships', () => {
      let foundHorizontal = false;
      let foundVertical = false;
      
      // Try multiple times to get both orientations
      for (let attempt = 0; attempt < 100 && (!foundHorizontal || !foundVertical); attempt++) {
        // Reset board for each attempt
        player.board = new (require('./seabattle.js').Board)();
        
        const ship = player.generateRandomShip();
        
        if (ship && ship.locations.length === SHIP_LENGTH) {
          const loc1 = player.board.parseLocation(ship.locations[0]);
          const loc2 = player.board.parseLocation(ship.locations[1]);
          
          if (loc1.row === loc2.row) {
            foundHorizontal = true;
          } else if (loc1.col === loc2.col) {
            foundVertical = true;
          }
        }
      }
      
      // At least one orientation should be found in 100 attempts
      expect(foundHorizontal || foundVertical).toBe(true);
    });
  });

  describe('placeShipsRandomly', () => {
    test('should place correct number of ships', () => {
      player.placeShipsRandomly();
      
      expect(player.ships).toHaveLength(NUM_SHIPS);
    });

    test('should place ships on the board', () => {
      player.placeShipsRandomly();
      
      let shipCellCount = 0;
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (player.board.grid[i][j] === 'S') {
            shipCellCount++;
          }
        }
      }
      
      expect(shipCellCount).toBe(NUM_SHIPS * SHIP_LENGTH);
    });

    test('should create ships with correct length', () => {
      player.placeShipsRandomly();
      
      player.ships.forEach(ship => {
        expect(ship.locations).toHaveLength(SHIP_LENGTH);
        expect(ship.hits).toHaveLength(SHIP_LENGTH);
      });
    });
  });

  describe('integration tests', () => {
    test('should handle complete game scenario', () => {
      // Place ships
      player.placeShipsRandomly();
      
      expect(player.ships).toHaveLength(NUM_SHIPS);
      expect(player.hasShipsRemaining()).toBe(true);
      
      // Sink all ships
      player.ships.forEach(ship => {
        ship.locations.forEach(location => {
          const result = player.receiveGuess(location);
          expect(result.hit).toBe(true);
        });
      });
      
      expect(player.hasShipsRemaining()).toBe(false);
      expect(player.numShips).toBe(0);
    });

    test('should maintain board state consistency', () => {
      player.placeShipsRandomly();
      
      // Test a few guesses
      const testGuesses = ['12', '34', '56', '78'];
      
      testGuesses.forEach(guess => {
        const result = player.receiveGuess(guess);
        const { row, col } = player.board.parseLocation(guess);
        
        if (result.hit) {
          expect(player.board.grid[row][col]).toBe('X');
        } else {
          expect(player.board.grid[row][col]).toBe('O');
        }
      });
    });
  });
}); 