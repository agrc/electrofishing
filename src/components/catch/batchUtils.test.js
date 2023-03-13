import { describe, expect, it } from 'vitest';
import config from '../../config';
import { batchFishWeights, getLastFishIdsWithEmptyWeights } from './batchUtils';

const fn = config.fieldNames.fish;

function getFishWeight(fishes, fishId) {
  return fishes.find((f) => f[fn.FISH_ID] === fishId)[fn.WEIGHT];
}

describe('batchFishWeight', () => {
  it('assigns the correct average weight to fish', () => {
    const existingFish = [
      {
        [fn.FISH_ID]: 1,
        [fn.PASS_NUM]: 1,
        [fn.WEIGHT]: 12,
        [fn.COUNT]: 3,
      },
      {
        [fn.FISH_ID]: 2,
        [fn.PASS_NUM]: 1,
        [fn.WEIGHT]: null,
        [fn.COUNT]: 1,
      },
      {
        [fn.FISH_ID]: 3,
        [fn.PASS_NUM]: 1,
        [fn.WEIGHT]: 12,
        [fn.COUNT]: 1,
      },
      {
        [fn.FISH_ID]: 4,
        [fn.PASS_NUM]: 1,
        [fn.WEIGHT]: null,
        [fn.COUNT]: 1,
      },
      {
        [fn.FISH_ID]: 5,
        [fn.PASS_NUM]: 1,
        [fn.WEIGHT]: null,
        [fn.COUNT]: 1,
      },
      {
        [fn.FISH_ID]: 6,
        [fn.PASS_NUM]: 1,
        [fn.WEIGHT]: null,
        [fn.COUNT]: 1,
      },
      {
        [fn.FISH_ID]: 7,
        [fn.PASS_NUM]: 2,
        [fn.WEIGHT]: null,
        [fn.COUNT]: 1,
      },
    ];

    const result = batchFishWeights(existingFish, 1, 10);
    expect(result.length).toBe(existingFish.length);
    expect(getFishWeight(result, 2)).toBeNull();
    expect(getFishWeight(result, 4)).toBe(3.33);
    expect(getFishWeight(result, 5)).toBe(3.33);
    expect(getFishWeight(result, 6)).toBe(3.33);
    expect(getFishWeight(result, 7)).toBeNull();
  });

  it('ignores fish with counts greater than one', () => {
    const existingFish = [
      {
        [fn.FISH_ID]: 1,
        [fn.PASS_NUM]: 1,
        [fn.WEIGHT]: null,
        [fn.COUNT]: 3,
      },
      {
        [fn.FISH_ID]: 2,
        [fn.PASS_NUM]: 1,
        [fn.WEIGHT]: null,
        [fn.COUNT]: 1,
      },
      {
        [fn.FISH_ID]: 3,
        [fn.PASS_NUM]: 1,
        [fn.WEIGHT]: null,
        [fn.COUNT]: 1,
      },
    ];

    const result = batchFishWeights(existingFish, 1, 10);

    expect(result.length).toBe(existingFish.length);
    expect(getFishWeight(result, 1)).toBeNull();
    expect(getFishWeight(result, 2)).toBe(5);
    expect(getFishWeight(result, 3)).toBe(5);
  });
});

describe('getLastFishIdsWithEmptyWeights', () => {
  it('requires at least two consecutive empty weights', () => {
    const existingFish = [
      {
        [fn.FISH_ID]: 1,
        [fn.PASS_NUM]: 1,
        [fn.WEIGHT]: null,
        [fn.COUNT]: 3,
      },
    ];

    const result = getLastFishIdsWithEmptyWeights(existingFish);

    expect(result.length).toBe(0);
  });
});
