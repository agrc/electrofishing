import { describe, it, expect } from 'vitest';
import config from '../config';
import { getFishDataForSubmission } from './data';

const fn = config.fieldNames.fish;

describe('getFishDataForSubmission', () => {
  it('excludes empty fish records', () => {
    const fish = [
      {
        [fn.SPECIES_CODE]: 'BG',
        [fn.LENGTH_TYPE]: 'STD',
        [fn.COUNT]: 1,
      },
      {
        [fn.SPECIES_CODE]: null,
        [fn.LENGTH_TYPE]: null,
        [fn.COUNT]: 1,
      },
    ];

    const result = getFishDataForSubmission(fish);

    expect(result.length).toBe(1);
    expect(result[0][fn.SPECIES_CODE]).toBe('BG');
  });

  it('expands fish with counts greater than one', () => {
    const fish = [
      {
        [fn.SPECIES_CODE]: 'BG',
        [fn.LENGTH_TYPE]: 'STD',
        [fn.COUNT]: 3,
        [fn.WEIGHT]: 12,
      },
      {
        [fn.SPECIES_CODE]: 'TEST',
        [fn.LENGTH_TYPE]: 'STD',
        [fn.COUNT]: 1,
        [fn.WEIGHT]: 12,
      },
    ];

    const result = getFishDataForSubmission(fish);

    expect(result.length).toBe(4);
    expect(result[0][fn.SPECIES_CODE]).toBe('BG');
    expect(result[0][fn.WEIGHT]).toBe(4);
    expect(result[0][fn.FISH_ID]).toBeDefined();
    expect(result[3][fn.SPECIES_CODE]).toBe('TEST');
    expect(result[3][fn.WEIGHT]).toBe(12);
    result.forEach((fish) => expect(fish[fn.COUNT]).toBeUndefined());
  });

  it('remove the moreInfo prop if present', () => {
    const fish = [
      {
        [fn.SPECIES_CODE]: 'BG',
        [fn.LENGTH_TYPE]: 'STD',
        [fn.COUNT]: 1,
        [fn.WEIGHT]: 12,
        moreInfo: 'some info',
      },
    ];

    const result = getFishDataForSubmission(fish);

    expect(result.length).toBe(1);
    expect(result[0][fn.SPECIES_CODE]).toBe('BG');
    expect(result[0].moreInfo).toBeUndefined();
  });
});
