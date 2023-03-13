import { describe, expect, it } from 'vitest';
import config from '../config';
import { getNewFish } from './samplingEventContext.jsx';

const fn = config.fieldNames.fish;

describe('getNewFish', () => {
  it('returns the correct count value', () => {
    const existingFish = [
      {
        [fn.SPECIES_CODE]: 'BG',
        [fn.LENGTH_TYPE]: 'STD',
        [fn.PASS_NUM]: 1,
        [fn.CATCH_ID]: 1,
      },
    ];

    const result = getNewFish('eventId', 1, existingFish);

    expect(result[fn.CATCH_ID]).toBe(2);
    expect(result[fn.PASS_NUM]).toBe(1);

    const result2 = getNewFish('eventId', 3, existingFish);

    expect(result2[fn.CATCH_ID]).toBe(1);
    expect(result2[fn.PASS_NUM]).toBe(3);
  });

  it("copies the previous fish's species and length type values", () => {
    const existingFish = [
      {
        [fn.PASS_NUM]: 1,
        [fn.CATCH_ID]: 1,
        [fn.SPECIES_CODE]: 'BG',
        [fn.LENGTH_TYPE]: 'STD',
      },
      {
        [fn.PASS_NUM]: 2,
        [fn.CATCH_ID]: 1,
        [fn.SPECIES_CODE]: 'CB',
        [fn.LENGTH_TYPE]: 'TEST',
      },
    ];

    const result = getNewFish('eventId', 2, existingFish);

    expect(result[fn.SPECIES_CODE]).toBe('CB');
    expect(result[fn.LENGTH_TYPE]).toBe('TEST');
  });
});
