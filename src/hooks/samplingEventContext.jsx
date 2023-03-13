import React from 'react';
import getGUID from '../helpers/getGUID';
import { useImmerReducer } from 'use-immer';
import config from '../config';
import PropTypes from 'prop-types';

const SamplingEventContext = React.createContext();
export const actionTypes = {
  LOCATION: 'LOCATION',
  CLEAR: 'CLEAR',
  OTHER: 'OTHER',
  HYDRATE: 'HYDRATE',
  EQUIPMENT: 'EQUIPMENT',
  ADD_EQUIPMENT: 'ADD_EQUIPMENT',
  REMOVE_EQUIPMENT: 'REMOVE_EQUIPMENT',
  FISHES: 'FISHES',
  ADD_FISH: 'ADD_FISH',
  REMOVE_FISH: 'REMOVE_FISH',
  UPDATE_FISH: 'UPDATE_FISH',
  ADD_PASS: 'ADD_PASS',
  UPDATE_HEALTH: 'UPDATE_HEALTH',
  ADD_TAG: 'ADD_TAG',
  UPDATE_TAG: 'UPDATE_TAG',
  REMOVE_TAG: 'REMOVE_TAG',
  ADD_DIET: 'ADD_DIET',
  UPDATE_DIET: 'UPDATE_DIET',
  REMOVE_DIET: 'REMOVE_DIET',
  HABITAT: 'HABITAT',
  UPDATE_TRANSECT: 'UPDATE_TRANSECT',
  ADD_TRANSECT: 'ADD_TRANSECT',
  UPDATE_MEASUREMENTS: 'UPDATE_MEASUREMENTS',
};

function getNewEquipment(eventId) {
  return {
    [config.fieldNames.equipment.EVENT_ID]: eventId,
    [config.fieldNames.equipment.TYPE]: 'backpack',
    [config.fieldNames.equipment.EQUIPMENT_ID]: getGUID(),
    [config.fieldNames.equipment.MODEL]: null,
    [config.fieldNames.equipment.ARRAY_TYPE]: null,
    [config.fieldNames.equipment.NUM_NETTERS]: null,
    [config.fieldNames.equipment.CATHODE_TYPE]: null,
    [config.fieldNames.equipment.NUM_ANODES]: null,
    [config.fieldNames.equipment.CATHODE_LEN]: null,
    [config.fieldNames.equipment.CATHODE_DIAMETER]: null,
    [config.fieldNames.equipment.MACHINE_RES]: null,
    [config.fieldNames.equipment.WAVEFORM]: null,
    [config.fieldNames.equipment.VOLTAGE]: null,
    [config.fieldNames.equipment.DUTY_CYCLE]: null,
    [config.fieldNames.equipment.FREQUENCY]: null,
    [config.fieldNames.equipment.AMPS]: null,
    [config.fieldNames.equipment.DURATION]: null,
  };
}

export function getNewFish(eventId, passNum, existingFish) {
  // get the last fish's catchId in the pass and increment it
  const lastFish = existingFish?.filter((fish) => fish[config.fieldNames.fish.PASS_NUM] === passNum).pop();

  return {
    ...getBlankFish(),
    [config.fieldNames.fish.EVENT_ID]: eventId,
    [config.fieldNames.fish.FISH_ID]: getGUID(),
    [config.fieldNames.fish.PASS_NUM]: passNum,
    [config.fieldNames.fish.CATCH_ID]: lastFish ? lastFish[config.fieldNames.fish.CATCH_ID] + 1 : 1,
    [config.fieldNames.fish.SPECIES_CODE]: lastFish ? lastFish[config.fieldNames.fish.SPECIES_CODE] : null,
    [config.fieldNames.fish.LENGTH_TYPE]: lastFish ? lastFish[config.fieldNames.fish.LENGTH_TYPE] : null,
  };
}

export function getBlankFish() {
  return {
    [config.fieldNames.fish.EVENT_ID]: null,
    [config.fieldNames.fish.FISH_ID]: null,
    [config.fieldNames.fish.PASS_NUM]: null,
    [config.fieldNames.fish.NOTES]: null,
    [config.fieldNames.fish.CATCH_ID]: null,
    [config.fieldNames.fish.SPECIES_CODE]: null,
    [config.fieldNames.fish.LENGTH_TYPE]: null,
    [config.fieldNames.fish.LENGTH]: null,
    [config.fieldNames.fish.WEIGHT]: null,
    [config.fieldNames.fish.COUNT]: 1,
  };
}

const getBlankHabitat = (eventId) => {
  return {
    [config.fieldNames.habitat.EVENT_ID]: eventId,
    [config.fieldNames.habitat.BANKVEG]: null,
    [config.fieldNames.habitat.DOVR]: null,
    [config.fieldNames.habitat.DUND]: null,
    [config.fieldNames.habitat.LGWD]: null,
    [config.fieldNames.habitat.POOL]: null,
    [config.fieldNames.habitat.SPNG]: null,
    [config.fieldNames.habitat.RIFF]: null,
    [config.fieldNames.habitat.RUNA]: null,
    [config.fieldNames.habitat.SUB_FINES]: null,
    [config.fieldNames.habitat.SUB_SAND]: null,
    [config.fieldNames.habitat.SUB_GRAV]: null,
    [config.fieldNames.habitat.SUB_COBB]: null,
    [config.fieldNames.habitat.SUB_RUBB]: null,
    [config.fieldNames.habitat.SUB_BOUL]: null,
    [config.fieldNames.habitat.SUB_BEDR]: null,
    [config.fieldNames.habitat.SIN]: null,
    [config.fieldNames.habitat.EROS]: null,
    [config.fieldNames.habitat.TEMP]: null,
    [config.fieldNames.habitat.PH]: null,
    [config.fieldNames.habitat.CON]: null,
    [config.fieldNames.habitat.OXYGEN]: null,
    [config.fieldNames.habitat.SOLIDS]: null,
    [config.fieldNames.habitat.TURBIDITY]: null,
    [config.fieldNames.habitat.ALKALINITY]: null,
    [config.fieldNames.habitat.BACKWATER]: null,
  };
};

const getNewTransect = (eventId) => {
  return {
    [config.fieldNames.transect.EVENT_ID]: eventId,
    [config.fieldNames.transect.BWID]: null,
    [config.fieldNames.transect.WWID]: null,
    [config.fieldNames.transect.STARTING_BANK]: null,
    [config.fieldNames.transect.TRANSECT_ID]: getGUID(),
  };
};

const getNewMeasurement = (transectId) => {
  return {
    [config.fieldNames.transectMeasurements.TRANSECT_ID]: transectId,
    [config.fieldNames.transectMeasurements.DEPTH]: null,
    [config.fieldNames.transectMeasurements.VELOCITY]: null,
    [config.fieldNames.transectMeasurements.SUBSTRATE]: null,
    [config.fieldNames.transectMeasurements.DISTANCE_START]: null,
  };
};

const getBlankState = () => {
  const eventId = getGUID();
  const transect = getNewTransect(eventId);

  return {
    [config.tableNames.samplingEvents]: {
      attributes: {
        [config.fieldNames.samplingEvents.EVENT_ID]: eventId,
        [config.fieldNames.samplingEvents.GEO_DEF]: null,
        [config.fieldNames.samplingEvents.LOCATION_NOTES]: null,
        [config.fieldNames.samplingEvents.EVENT_DATE]: null,
        [config.fieldNames.samplingEvents.EVENT_TIME]: null,
        [config.fieldNames.samplingEvents.OBSERVERS]: null,
        [config.fieldNames.samplingEvents.PURPOSE]: null,
        [config.fieldNames.samplingEvents.WEATHER]: null,
        [config.fieldNames.samplingEvents.STATION_ID]: null,
        [config.fieldNames.samplingEvents.SEGMENT_LENGTH]: null,
        [config.fieldNames.samplingEvents.NUM_PASSES]: 1,
      },
      geometry: null,
    },
    other: {
      selectedStationName: '',
      totalSediment: 0,
    },
    [config.tableNames.equipment]: [getNewEquipment(eventId)],
    [config.tableNames.anodes]: [],
    [config.tableNames.fish]: [getNewFish(eventId, 1, null)],
    [config.tableNames.health]: [],
    [config.tableNames.tags]: [],
    [config.tableNames.diet]: [],
    [config.tableNames.habitat]: getBlankHabitat(eventId),
    [config.tableNames.transect]: [transect],
    [config.tableNames.transectMeasurements]: [],
  };
};

const reducer = (draft, action) => {
  const getTag = (fishId, tagIndex) => {
    const tagsForThisFish = draft[config.tableNames.tags].filter((t) => t[config.fieldNames.tags.FISH_ID] === fishId);

    return tagsForThisFish[tagIndex];
  };

  const getDiet = (fishId, dietIndex) => {
    const tagsForThisFish = draft[config.tableNames.diet].filter((t) => t[config.fieldNames.diet.FISH_ID] === fishId);

    return tagsForThisFish[dietIndex];
  };

  const addMoreInfoToFish = (fishId) => {
    const fish = draft[config.tableNames.fish].find((f) => f[config.fieldNames.fish.FISH_ID] === fishId);
    fish.moreInfo = true;
  };

  const updateTotalSediment = () => {
    draft.other.totalSediment = [
      config.fieldNames.habitat.SUB_FINES,
      config.fieldNames.habitat.SUB_SAND,
      config.fieldNames.habitat.SUB_GRAV,
      config.fieldNames.habitat.SUB_COBB,
      config.fieldNames.habitat.SUB_RUBB,
      config.fieldNames.habitat.SUB_BOUL,
      config.fieldNames.habitat.SUB_BEDR,
    ].reduce((total, fieldName) => (total += draft[config.tableNames.habitat][fieldName] || 0), 0);
  };

  switch (action.type) {
    case actionTypes.LOCATION:
      if (action.meta === 'geometry') {
        draft[config.tableNames.samplingEvents].geometry = action.payload.geometry;
        draft[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.GEO_DEF] =
          action.payload.geoDef;
      } else {
        draft[config.tableNames.samplingEvents].attributes[action.meta] = action.payload;
      }

      break;

    case actionTypes.OTHER:
      draft.other[action.meta] = action.payload;

      break;

    case actionTypes.EQUIPMENT: {
      const found = draft[config.tableNames.equipment].some((equipment, index) => {
        if (equipment[config.fieldNames.equipment.EQUIPMENT_ID] === action.meta) {
          draft[config.tableNames.equipment][index] = action.payload.equipment;
          draft[config.tableNames.anodes] = draft[config.tableNames.anodes].filter((anode) => {
            return anode[config.fieldNames.anodes.EQUIPMENT_ID] !== action.meta;
          });
          draft[config.tableNames.anodes].push(...action.payload.anodes);

          return true;
        }

        return false;
      });

      if (!found) {
        throw new Error(`Equipment not found in state! Equipment ID: ${action.meta}`);
      }

      break;
    }

    case actionTypes.ADD_EQUIPMENT:
      draft[config.tableNames.equipment].push(
        getNewEquipment(draft[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.EVENT_ID])
      );

      break;

    case actionTypes.REMOVE_EQUIPMENT:
      draft[config.tableNames.equipment] = draft[config.tableNames.equipment].filter((equipment) => {
        return equipment[config.fieldNames.equipment.EQUIPMENT_ID] !== action.meta;
      });

      draft[config.tableNames.anodes] = draft[config.tableNames.anodes].filter((anode) => {
        return anode[config.fieldNames.anodes.EQUIPMENT_ID] !== action.meta;
      });

      break;

    case actionTypes.FISHES:
      draft[config.tableNames.fish] = action.payload;

      break;

    case actionTypes.ADD_PASS: {
      const newPass =
        draft[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.NUM_PASSES] + 1;
      draft[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.NUM_PASSES] = newPass;
      draft[config.tableNames.fish].push(
        getNewFish(
          draft[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.EVENT_ID],
          newPass,
          null
        )
      );

      break;
    }

    case actionTypes.ADD_FISH:
      draft[config.tableNames.fish].push(
        getNewFish(
          draft[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.EVENT_ID],
          action.payload,
          draft[config.tableNames.fish]
        )
      );

      break;

    case actionTypes.REMOVE_FISH:
      draft[config.tableNames.fish] = draft[config.tableNames.fish].filter(
        (fish) => fish[config.fieldNames.fish.FISH_ID] !== action.payload
      );

      draft[config.tableNames.tags] = draft[config.tableNames.tags].filter(
        (tag) => tag[config.fieldNames.tags.FISH_ID] !== action.payload
      );
      draft[config.tableNames.health] = draft[config.tableNames.health].filter(
        (health) => health[config.fieldNames.health.FISH_ID] !== action.payload
      );
      draft[config.tableNames.diet] = draft[config.tableNames.diet].filter(
        (diet) => diet[config.fieldNames.diet.FISH_ID] !== action.payload
      );

      break;

    case actionTypes.UPDATE_FISH: {
      const updateFishIndex = draft[config.tableNames.fish].findIndex(
        (f) => f[config.fieldNames.fish.FISH_ID] === action.meta
      );
      draft[config.tableNames.fish][updateFishIndex] = {
        ...draft[config.tableNames.fish][updateFishIndex],
        ...action.payload,
      };

      break;
    }
    case actionTypes.UPDATE_HEALTH: {
      const updateHealthIndex = draft[config.tableNames.health].findIndex(
        (f) => f[config.fieldNames.fish.FISH_ID] === action.meta
      );

      if (updateHealthIndex === -1) {
        draft[config.tableNames.health].push(action.payload);
      } else {
        draft[config.tableNames.health][updateHealthIndex] = {
          ...draft[config.tableNames.health][updateHealthIndex],
          ...action.payload,
        };
      }

      addMoreInfoToFish(action.meta);

      break;
    }

    case actionTypes.ADD_TAG:
      draft[config.tableNames.tags].push(action.payload);

      addMoreInfoToFish(action.payload[config.fieldNames.tags.FISH_ID]);

      break;

    case actionTypes.UPDATE_TAG: {
      const tagToUpdate = getTag(action.meta.fishId, action.meta.tagIndex);

      const updateTagIndex = draft[config.tableNames.tags].findIndex((t) => t === tagToUpdate);

      draft[config.tableNames.tags][updateTagIndex] = action.payload;

      break;
    }

    case actionTypes.REMOVE_TAG: {
      const tagToRemove = getTag(action.meta.fishId, action.meta.tagIndex);

      draft[config.tableNames.tags] = draft[config.tableNames.tags].filter((t) => t !== tagToRemove);

      break;
    }

    case actionTypes.ADD_DIET:
      draft[config.tableNames.diet].push(action.payload);

      addMoreInfoToFish(action.meta);

      break;

    case actionTypes.UPDATE_DIET: {
      const dietToUpdate = getDiet(action.meta.fishId, action.meta.dietIndex);

      const updateDietIndex = draft[config.tableNames.diet].findIndex((t) => t === dietToUpdate);

      draft[config.tableNames.diet][updateDietIndex] = {
        ...draft[config.tableNames.diet][updateDietIndex],
        ...action.payload,
      };

      break;
    }

    case actionTypes.REMOVE_DIET: {
      const dietToRemove = getDiet(action.meta.fishId, action.meta.dietIndex);

      draft[config.tableNames.diet] = draft[config.tableNames.diet].filter((t) => t !== dietToRemove);

      break;
    }

    case actionTypes.HABITAT:
      draft[config.tableNames.habitat][action.meta] = action.payload;

      updateTotalSediment();

      break;

    case actionTypes.ADD_TRANSECT:
      draft[config.tableNames.transect].push(getNewTransect());

      break;

    case actionTypes.UPDATE_TRANSECT: {
      const transectIndex = action.meta - 1;
      draft[config.tableNames.transect][transectIndex] = {
        ...draft[config.tableNames.transect][transectIndex],
        ...action.payload,
      };

      break;
    }

    case actionTypes.UPDATE_MEASUREMENTS:
      draft[config.tableNames.transectMeasurements] = action.payload;

      break;

    case actionTypes.ADD_MEASUREMENT:
      draft[config.tableNames.transectMeasurements].push(getNewMeasurement(action.payload));

      break;

    case actionTypes.CLEAR:
      return getBlankState();

    case actionTypes.HYDRATE:
      // this can be removed once these widgets are converted to components and use eventState:
      // Habitat
      config.eventId =
        action.payload[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.EVENT_ID];

      return {
        ...getBlankState(), // fill in missing holes if we have added new props since the last release
        ...action.payload,
      };

    default:
      break;
  }
};

export function SamplingEventProvider({ children }) {
  const [eventState, eventDispatch] = useImmerReducer(reducer, getBlankState());

  return (
    <SamplingEventContext.Provider value={{ eventState, eventDispatch }}>{children}</SamplingEventContext.Provider>
  );
}

SamplingEventProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useSamplingEventContext() {
  const context = React.useContext(SamplingEventContext);

  if (context === undefined) {
    throw new Error('useSamplingEventContext must be used within a SamplingEventProvider');
  }

  return context;
}
