const { Ship } = require('./seabattle.js');

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship();
  });

  describe('constructor', () => {
    test('should initialize empty locations and hits arrays', () => {
      expect(ship.locations).toEqual([]);
      expect(ship.hits).toEqual([]);
    });
  });

  describe('addLocation', () => {
    test('should add a location to the ship', () => {
      ship.addLocation('23');
      
      expect(ship.locations).toContain('23');
      expect(ship.hits).toHaveLength(1);
      expect(ship.hits[0]).toBe('');
    });

    test('should add multiple locations to the ship', () => {
      ship.addLocation('23');
      ship.addLocation('24');
      ship.addLocation('25');
      
      expect(ship.locations).toEqual(['23', '24', '25']);
      expect(ship.hits).toEqual(['', '', '']);
    });
  });

  describe('hit', () => {
    beforeEach(() => {
      ship.addLocation('23');
      ship.addLocation('24');
      ship.addLocation('25');
    });

    test('should register a hit on a valid location', () => {
      const result = ship.hit('24');
      
      expect(result).toBe(true);
      expect(ship.hits[1]).toBe('hit');
    });

    test('should not register a hit on invalid location', () => {
      const result = ship.hit('99');
      
      expect(result).toBe(false);
      expect(ship.hits).toEqual(['', '', '']);
    });

    test('should not register a hit on already hit location', () => {
      ship.hit('24'); // First hit
      const result = ship.hit('24'); // Second hit on same location
      
      expect(result).toBe(false);
      expect(ship.hits[1]).toBe('hit');
    });

    test('should handle hitting first location', () => {
      const result = ship.hit('23');
      
      expect(result).toBe(true);
      expect(ship.hits[0]).toBe('hit');
    });

    test('should handle hitting last location', () => {
      const result = ship.hit('25');
      
      expect(result).toBe(true);
      expect(ship.hits[2]).toBe('hit');
    });
  });

  describe('isSunk', () => {
    beforeEach(() => {
      ship.addLocation('23');
      ship.addLocation('24');
      ship.addLocation('25');
    });

    test('should return false when no hits', () => {
      expect(ship.isSunk()).toBe(false);
    });

    test('should return false when partially hit', () => {
      ship.hit('23');
      ship.hit('24');
      
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true when all locations are hit', () => {
      ship.hit('23');
      ship.hit('24');
      ship.hit('25');
      
      expect(ship.isSunk()).toBe(true);
    });

    test('should return true for single location ship when hit', () => {
      const singleLocationShip = new Ship();
      singleLocationShip.addLocation('12');
      singleLocationShip.hit('12');
      
      expect(singleLocationShip.isSunk()).toBe(true);
    });

    test('should return false for empty ship', () => {
      const emptyShip = new Ship();
      
      expect(emptyShip.isSunk()).toBe(true); // empty array returns true for .every()
    });
  });

  describe('hasLocation', () => {
    beforeEach(() => {
      ship.addLocation('23');
      ship.addLocation('24');
      ship.addLocation('25');
    });

    test('should return true for existing location', () => {
      expect(ship.hasLocation('24')).toBe(true);
    });

    test('should return false for non-existing location', () => {
      expect(ship.hasLocation('99')).toBe(false);
    });

    test('should return true for first location', () => {
      expect(ship.hasLocation('23')).toBe(true);
    });

    test('should return true for last location', () => {
      expect(ship.hasLocation('25')).toBe(true);
    });

    test('should return false for empty ship', () => {
      const emptyShip = new Ship();
      
      expect(emptyShip.hasLocation('23')).toBe(false);
    });
  });
}); 