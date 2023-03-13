import config from '../config.js';
import getGUID from './getGUID.js';

const fn = config.fieldNames.fish;

export function getFishDataForSubmission(fish) {
  // exclude empty records
  let data = fish.filter((f) => f[fn.SPECIES_CODE]);

  // explode rows with counts greater than 1
  data = data.reduce((expandedRows, nextRow) => {
    nextRow = structuredClone(nextRow);
    let count = nextRow[fn.COUNT];
    delete nextRow[fn.COUNT];
    if (count === 1) {
      delete nextRow.moreInfo;
      expandedRows.push(nextRow);
    } else {
      const weight = nextRow[fn.WEIGHT];
      let averageWeight;
      if (weight) {
        averageWeight = nextRow[fn.WEIGHT] / count;
      }
      while (count > 0) {
        nextRow[fn.FISH_ID] = getGUID();

        if (weight) {
          nextRow[fn.WEIGHT] = averageWeight;
        }

        expandedRows.push(structuredClone(nextRow));

        count = count - 1;
      }
    }

    return expandedRows;
  }, []);

  return data;
}
