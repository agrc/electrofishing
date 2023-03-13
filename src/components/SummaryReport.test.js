import { describe, it, expect } from 'vitest';
import eventData from '../../tests/data/NewCollectionEventData.json';
import { getSummaryData, getStats, getFultons } from './SummaryReport.jsx';

describe('getSummaryData', () => {
  it('should return an object with the correct keys', () => {
    const result = getSummaryData(eventData);
    expect(result).toHaveProperty('species');
    expect(result).toHaveProperty('numPasses');
  });

  it('should return the correct species count', () => {
    const result = getSummaryData(eventData);
    expect(result.species.length).toBe(3);
  });

  it('should return the correct number of passes', () => {
    const result = getSummaryData(eventData);
    expect(result.numPasses).toBe(2);
  });

  it('should return the correct species names', () => {
    const result = getSummaryData(eventData);
    const speciesNames = result.species.map((s) => s.name);
    expect(speciesNames).toEqual(['BHBK', 'CB', 'BS']);
  });

  it('should return the correct species counts', () => {
    const result = getSummaryData(eventData);
    // BHBK
    expect(result.species[0].counts).toEqual({
      1: 11,
      2: 9,
    });
  });

  it('should return the correct weight stats', () => {
    const result = getSummaryData(eventData);
    // BS
    expect(result.species[2].weight).toEqual({
      min: 1,
      max: 5,
      avg: 3.67,
    });
  });
});

describe('getStats', () => {
  it('should return the correct stats', () => {
    const result = getStats([1, 2, 3.1235, 4, 5]);
    expect(result).toEqual({
      min: 1,
      max: 5,
      avg: 3.02,
    });
  });

  it('can handle null values', () => {
    const result = getStats([1, 2, null, 4, 5]);
    expect(result).toEqual({
      min: 1,
      max: 5,
      avg: 3,
    });
  });

  it('can handle all nulls', () => {
    const result = getStats([null, null, null, null, null]);
    expect(result).toEqual({
      min: null,
      max: null,
      avg: null,
    });
  });

  it('rounds all values', () => {
    const result = getStats([1.1234, 2.1234, 3.1234, 4.1234, 5.1234]);
    expect(result).toEqual({
      min: 1.12,
      max: 5.12,
      avg: 3.12,
    });
  });
});

describe('getFultonStats', () => {
  it('should return the correct stats', () => {
    const result = getFultons([1, 2], [6, 7]);
    expect(result).toEqual([462.96, 583.09]);
  });
});
