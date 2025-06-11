const { CPUPlayer, BOARD_SIZE } = require('./seabattle.js');

describe('CPUPlayer', () => {
  let cpu;

  beforeEach(() => {
    cpu = new CPUPlayer();
  });

  describe('constructor', () => {
    test('should initialize CPU player with correct properties', () => {
      expect(cpu.name).toBe('CPU');
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
      expect(cpu.ships).toEqual([]);
      expect(cpu.guesses).toEqual([]);
      expect(cpu.board).toBeDefined();
    });

    test('should inherit from Player class', () => {
      expect(cpu.numShips).toBe(3); // NUM_SHIPS
      expect(cpu.board.grid).toBeDefined();
      expect(typeof cpu.hasShipsRemaining).toBe('function');
    });
  });

  describe('makeGuess', () => {
    test('should return a valid coordinate string in hunt mode', () => {
      const previousGuesses = [];
      const guess = cpu.makeGuess(previousGuesses);
      
      expect(typeof guess).toBe('string');
      expect(guess).toHaveLength(2);
      
      const row = parseInt(guess[0]);
      const col = parseInt(guess[1]);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(BOARD_SIZE);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(BOARD_SIZE);
    });

    test('should not repeat previous guesses in hunt mode', () => {
      const previousGuesses = ['00', '01', '02', '10', '11', '12'];
      const guess = cpu.makeGuess(previousGuesses);
      
      expect(previousGuesses).not.toContain(guess);
    });

    test('should use target queue when in target mode', () => {
      cpu.mode = 'target';
      cpu.targetQueue = ['23', '24', '25'];
      const previousGuesses = [];
      
      const guess = cpu.makeGuess(previousGuesses);
      
      expect(['23', '24', '25']).toContain(guess);
      expect(cpu.targetQueue).toHaveLength(2); // One item should be removed
    });

    test('should switch to hunt mode when target queue is empty', () => {
      cpu.mode = 'target';
      cpu.targetQueue = ['23'];
      const previousGuesses = [];
      
      const guess = cpu.makeGuess(previousGuesses);
      
      expect(guess).toBe('23');
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toHaveLength(0);
    });

    test('should skip already guessed targets and fall back to hunt mode', () => {
      cpu.mode = 'target';
      cpu.targetQueue = ['23', '24'];
      const previousGuesses = ['23', '24']; // Both targets already guessed
      
      const guess = cpu.makeGuess(previousGuesses);
      
      expect(cpu.mode).toBe('hunt');
      expect(previousGuesses).not.toContain(guess);
    });

    test('should handle board almost full scenario', () => {
      // Create a list of almost all possible guesses
      const previousGuesses = [];
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          if (i < BOARD_SIZE - 1 || j < BOARD_SIZE - 1) { // Leave 99 available
            previousGuesses.push(`${i}${j}`);
          }
        }
      }
      
      const guess = cpu.makeGuess(previousGuesses);
      
      expect(guess).toBe('99');
      expect(previousGuesses).not.toContain(guess);
    });
  });

  describe('processGuessResult', () => {
    beforeEach(() => {
      cpu.mode = 'hunt';
      cpu.targetQueue = [];
    });

    test('should switch to target mode and add adjacent targets on hit', () => {
      cpu.processGuessResult('45', true, false);
      
      expect(cpu.mode).toBe('target');
      expect(cpu.targetQueue.length).toBeGreaterThan(0);
      
      // Should contain valid adjacent cells
      const expectedAdjacent = ['35', '55', '44', '46'];
      expectedAdjacent.forEach(coord => {
        expect(cpu.targetQueue).toContain(coord);
      });
    });

    test('should switch to hunt mode and clear queue when ship is sunk', () => {
      cpu.mode = 'target';
      cpu.targetQueue = ['23', '24', '25'];
      
      cpu.processGuessResult('34', true, true);
      
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
    });

    test('should not change mode on miss', () => {
      cpu.mode = 'hunt';
      cpu.processGuessResult('45', false, false);
      
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
    });

    test('should not change mode when already in target mode and miss', () => {
      cpu.mode = 'target';
      cpu.targetQueue = ['23', '24'];
      
      cpu.processGuessResult('45', false, false);
      
      expect(cpu.mode).toBe('target');
      expect(cpu.targetQueue).toEqual(['23', '24']);
    });
  });

  describe('addAdjacentTargets', () => {
    beforeEach(() => {
      cpu.targetQueue = [];
    });

    test('should add all valid adjacent targets for center position', () => {
      cpu.addAdjacentTargets('45');
      
      const expected = ['35', '55', '44', '46'];
      expect(cpu.targetQueue).toEqual(expect.arrayContaining(expected));
      expect(cpu.targetQueue).toHaveLength(4);
    });

    test('should add only valid adjacent targets for corner position', () => {
      cpu.addAdjacentTargets('00');
      
      const expected = ['10', '01'];
      expect(cpu.targetQueue).toEqual(expect.arrayContaining(expected));
      expect(cpu.targetQueue).toHaveLength(2);
    });

    test('should add only valid adjacent targets for edge position', () => {
      cpu.addAdjacentTargets('05');
      
      const expected = ['15', '04', '06'];
      expect(cpu.targetQueue).toEqual(expect.arrayContaining(expected));
      expect(cpu.targetQueue).toHaveLength(3);
    });

    test('should add only valid adjacent targets for bottom-right corner', () => {
      cpu.addAdjacentTargets('99');
      
      const expected = ['89', '98'];
      expect(cpu.targetQueue).toEqual(expect.arrayContaining(expected));
      expect(cpu.targetQueue).toHaveLength(2);
    });

    test('should not add duplicate targets', () => {
      cpu.targetQueue = ['35', '44'];
      cpu.addAdjacentTargets('45');
      
      // Should not duplicate existing targets
      const targetCount35 = cpu.targetQueue.filter(t => t === '35').length;
      const targetCount44 = cpu.targetQueue.filter(t => t === '44').length;
      
      expect(targetCount35).toBe(1);
      expect(targetCount44).toBe(1);
    });

    test('should handle all edge cases for board boundaries', () => {
      // Test all edges and corners
      const testCases = [
        { pos: '00', expected: ['10', '01'] },
        { pos: '09', expected: ['19', '08'] },
        { pos: '90', expected: ['80', '91'] },
        { pos: '99', expected: ['89', '98'] },
        { pos: '50', expected: ['40', '60', '51'] },
        { pos: '59', expected: ['49', '69', '58'] },
        { pos: '05', expected: ['15', '04', '06'] },
        { pos: '95', expected: ['85', '94', '96'] }
      ];
      
      testCases.forEach(({ pos, expected }) => {
        cpu.targetQueue = [];
        cpu.addAdjacentTargets(pos);
        expect(cpu.targetQueue).toEqual(expect.arrayContaining(expected));
        expect(cpu.targetQueue).toHaveLength(expected.length);
      });
    });
  });

  describe('AI behavior integration tests', () => {
    test('should demonstrate complete hunt-to-target-to-hunt cycle', () => {
      // Start in hunt mode
      expect(cpu.mode).toBe('hunt');
      
      // Make a guess and get a hit (but not sunk)
      const guess1 = cpu.makeGuess([]);
      cpu.processGuessResult(guess1, true, false);
      
      // Should switch to target mode
      expect(cpu.mode).toBe('target');
      expect(cpu.targetQueue.length).toBeGreaterThan(0);
      
      // Make another guess in target mode
      const previousGuesses = [guess1];
      const guess2 = cpu.makeGuess(previousGuesses);
      
      // Simulate sinking the ship
      cpu.processGuessResult(guess2, true, true);
      
      // Should switch back to hunt mode
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toHaveLength(0);
    });

    test('should handle multiple hits without sinking', () => {
      const previousGuesses = [];
      
      // First hit
      const guess1 = cpu.makeGuess(previousGuesses);
      previousGuesses.push(guess1);
      cpu.processGuessResult(guess1, true, false);
      
      expect(cpu.mode).toBe('target');
      const firstQueueSize = cpu.targetQueue.length;
      
      // Second hit (still not sunk)
      const guess2 = cpu.makeGuess(previousGuesses);
      previousGuesses.push(guess2);
      cpu.processGuessResult(guess2, true, false);
      
      expect(cpu.mode).toBe('target');
      // Queue might have more targets now
      expect(cpu.targetQueue.length).toBeGreaterThanOrEqual(0);
    });

    test('should maintain valid state throughout multiple operations', () => {
      const allGuesses = [];
      let operations = 0;
      const maxOperations = 20;
      
      while (operations < maxOperations) {
        // Make a guess
        const guess = cpu.makeGuess(allGuesses);
        expect(allGuesses).not.toContain(guess);
        allGuesses.push(guess);
        
        // Simulate random result
        const hit = Math.random() < 0.3; // 30% hit rate
        const sunk = hit && Math.random() < 0.2; // 20% chance of sinking if hit
        
        cpu.processGuessResult(guess, hit, sunk);
        
        // Verify state consistency
        expect(['hunt', 'target']).toContain(cpu.mode);
        if (cpu.mode === 'hunt') {
          expect(cpu.targetQueue).toHaveLength(0);
        }
        
        operations++;
      }
      
      expect(allGuesses).toHaveLength(maxOperations);
      expect(new Set(allGuesses)).toHaveProperty('size', maxOperations); // All unique
    });
  });
}); 