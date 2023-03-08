import config from '../../config';

const fn = config.fieldNames.fish;

export function getLastFishIdsWithEmptyWeights(fishes) {
  const ids = [];
  fishes.reverse();
  fishes.every((fish) => {
    if (fish[fn.WEIGHT] === null && fish[fn.COUNT] === 1) {
      ids.push(fish[fn.FISH_ID]);

      return true;
    }

    return false;
  });

  return ids.length > 1 ? ids : [];
}

export function batchFishWeights(fishes, passNum, weight) {
  const filtered = fishes.filter((fish) => fish[fn.PASS_NUM] === passNum);

  const fishIdsWithEmptyWeights = getLastFishIdsWithEmptyWeights(filtered);

  const averageWeight = Number.parseFloat((weight / fishIdsWithEmptyWeights.length).toFixed(2));

  return fishes.map((fish) => {
    if (fishIdsWithEmptyWeights.includes(fish[fn.FISH_ID])) {
      return {
        ...fish,
        [fn.WEIGHT]: averageWeight,
      };
    }

    return fish;
  });
}
