import React from 'react';
import config from '../../config';
import { actionTypes, useSamplingEventContext } from '../../hooks/samplingEventContext';
import DomainDrivenDropdown from '../DomainDrivenDropdown';
import Health from './Health';
import PropTypes from 'prop-types';
import Tag from './Tag';
import DataGrid, { DomainDrivenDropdownCell, NumericInputCell } from '../DataGrid';
import DataGridAddDeleteButtons from '../DataGridAddDeleteButtons';
import useDebounce from '../../hooks/useDebounce';

const TABS = {
  diet: 'Diet_tab',
  tags: 'Tags_tab',
  health: 'Health_tab',
  collection: 'Collection_tab',
  notes: 'Notes_tab',
};

function MoreInfoDialog({ fish, health, tags, diets, currentPass }) {
  const [currentTab, setCurrentTab] = React.useState(null);
  const { eventDispatch } = useSamplingEventContext();
  const enabled = fish && fish[config.fieldNames.fish.COUNT] === 1;

  const modal = React.useRef(null);
  React.useEffect(() => {
    console.log('currentTab', currentTab);
    if (currentTab) {
      $(modal.current).modal('show');
      $(`a[href='#${currentTab}']`).tab('show');
    } else {
      $(modal.current).modal('hide');
    }
  }, [currentTab]);
  const fishId = fish && fish[config.fieldNames.fish.FISH_ID];

  const onTagChange = (fishId, tagIndex, newTagData) => {
    eventDispatch({
      type: actionTypes.UPDATE_TAG,
      payload: newTagData,
      meta: {
        fishId,
        tagIndex,
      },
    });
  };

  const addNewTag = React.useCallback(() => {
    eventDispatch({
      type: actionTypes.ADD_TAG,
      payload: {
        [config.fieldNames.tags.FISH_ID]: fishId,
        [config.fieldNames.tags.NUMBER]: null,
        [config.fieldNames.tags.TRANSPONDER_FREQ]: null,
        [config.fieldNames.tags.TRANSMITTER_FREQ]: null,
        [config.fieldNames.tags.TRANSMITTER_FREQ_TYPE]: null,
        [config.fieldNames.tags.TYPE]: null,
        [config.fieldNames.tags.LOCATION]: null,
        [config.fieldNames.tags.COLOR]: null,
        [config.fieldNames.tags.NEW_TAG]: null,
      },
    });
  }, [eventDispatch, fishId]);

  const removeTag = (fishId, tagIndex) => {
    eventDispatch({
      type: actionTypes.REMOVE_TAG,
      meta: {
        fishId,
        tagIndex,
      },
    });
  };

  const addHealth = React.useCallback(() => {
    const fn = config.fieldNames.health;

    eventDispatch({
      type: actionTypes.UPDATE_HEALTH,
      payload: {
        [fn.FISH_ID]: fishId,
        [fn.EYE]: null,
        [fn.GILL]: null,
        [fn.PSBR]: null,
        [fn.THYMUS]: null,
        [fn.FAT]: null,
        [fn.SPLEEN]: null,
        [fn.HIND]: null,
        [fn.KIDNEY]: null,
        [fn.LIVER]: null,
        [fn.BILE]: null,
        [fn.GENDER]: null,
        [fn.REPRODUCTIVE]: null,
        [fn.HEMATOCRIT]: null,
        [fn.LEUKOCRIT]: null,
        [fn.PLPRO]: null,
        [fn.FIN]: null,
        [fn.OPERCLE]: null,
        [fn.COLLECTION_PART]: null,
      },
      meta: fishId,
    });
  }, [eventDispatch, fishId]);

  const fnDiet = config.fieldNames.diet;
  const addNewDiet = React.useCallback(() => {
    eventDispatch({
      type: actionTypes.ADD_DIET,
      payload: {
        [config.fieldNames.diet.FISH_ID]: fishId,
        [config.fieldNames.diet.CLASS]: null,
        [config.fieldNames.diet.FISH_SPECIES]: null,
        [config.fieldNames.diet.MEASUREMENT_TYPE]: null,
        [config.fieldNames.diet.MEASUREMENT]: null,
      },
      meta: fishId,
    });
  }, [eventDispatch, fishId]);

  // wait to create a new tag, health and diet until the user opens the more info dialog
  React.useEffect(() => {
    if (currentTab && tags.length === 0) {
      addNewTag();
    }

    if (currentTab && !health) {
      addHealth();
    }

    if (currentTab && diets.length === 0) {
      addNewDiet();
    }
  }, [addHealth, addNewDiet, addNewTag, currentTab, diets.length, health, tags.length]);

  const hiddenDietColumns = [fnDiet.FISH_ID];
  const dietColumns = [
    { header: fnDiet.FISH_ID, accessorKey: fnDiet.FISH_ID },
    {
      header: 'Class',
      accessorKey: fnDiet.CLASS,
      cell: DomainDrivenDropdownCell,
      meta: {
        dropdownProps: {
          featureServiceUrl: config.urls.dietFeatureService,
          fieldName: fnDiet.CLASS,
        },
      },
    },
    {
      header: 'Fish Species',
      accessorKey: fnDiet.FISH_SPECIES,
      cell: DomainDrivenDropdownCell,
      meta: {
        dropdownProps: {
          featureServiceUrl: config.urls.dietFeatureService,
          fieldName: fnDiet.FISH_SPECIES,
        },
      },
    },
    {
      header: 'Type',
      accessorKey: fnDiet.MEASUREMENT_TYPE,
      cell: DomainDrivenDropdownCell,
      meta: {
        dropdownProps: {
          featureServiceUrl: config.urls.dietFeatureService,
          fieldName: fnDiet.MEASUREMENT_TYPE,
        },
      },
    },
    {
      header: 'Measurement',
      accessorKey: fnDiet.MEASUREMENT,
      cell: NumericInputCell,
      meta: {
        inputProps: {
          min: 0,
        },
      },
    },
  ];

  const [notes, setNotes] = React.useState((fish && fish[config.fieldNames.fish.NOTES]) || '');
  const onNotesChange = useDebounce((newNotes) => {
    console.log('newNotes', newNotes);
    eventDispatch({
      type: actionTypes.UPDATE_FISH,
      payload: {
        [config.fieldNames.fish.NOTES]: newNotes.length > 0 ? newNotes : null,
        moreInfo: true,
      },
      meta: fishId,
    });
  }, 300);

  React.useEffect(() => {
    onNotesChange(notes);
  }, [notes, onNotesChange]);

  const onDietChange = (rowIndex, columnId, newValue) => {
    eventDispatch({
      type: actionTypes.UPDATE_DIET,
      payload: {
        [columnId]: newValue,
      },
      meta: {
        fishId,
        dietIndex: rowIndex,
      },
    });
  };

  const [selectedDietIndex, setSelectedDietIndex] = React.useState(null);

  const deleteCurrentDiet = () => {
    eventDispatch({
      type: actionTypes.REMOVE_DIET,
      meta: {
        fishId,
        dietIndex: selectedDietIndex,
      },
    });
    setSelectedDietIndex(null);
  };

  return (
    <>
      <div className="btn-right-container pull-right btn-toolbar">
        <div className="btn-group more-info">
          <button className="btn btn-default" disabled={!enabled} onClick={() => setCurrentTab(TABS.diet)}>
            {' '}
            Diet
          </button>
          <button className="btn btn-default" disabled={!enabled} onClick={() => setCurrentTab(TABS.tags)}>
            {' '}
            Tags
          </button>
          <button className="btn btn-default" disabled={!enabled} onClick={() => setCurrentTab(TABS.health)}>
            {' '}
            Health
          </button>
          <button className="btn btn-default" disabled={!enabled} onClick={() => setCurrentTab(TABS.collection)}>
            Hard Body Parts
          </button>
          <button className="btn btn-default" disabled={!enabled} onClick={() => setCurrentTab(TABS.notes)}>
            {' '}
            Notes
          </button>
        </div>
      </div>

      <div
        className="more-info-dialog modal fade"
        aria-hidden="true"
        role="dialog"
        tabIndex="-1"
        ref={modal}
        data-backdrop="static"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-hidden="true"
                onClick={() => setCurrentTab(null)}
              >
                &times;
              </button>
              <h4>
                Fish #{fish && fish[config.fieldNames.fish.CATCH_ID]} (Pass #{currentPass})
              </h4>
            </div>
            <div className="modal-body">
              <ul className="nav nav-tabs">
                <li>
                  <a href={`#${TABS.diet}`} data-toggle="tab">
                    Diet
                  </a>
                </li>
                <li>
                  <a href={`#${TABS.tags}`} data-toggle="tab">
                    Tags
                  </a>
                </li>
                <li>
                  <a href={`#${TABS.health}`} data-toggle="tab">
                    Health
                  </a>
                </li>
                <li>
                  <a href={`#${TABS.collection}`} data-toggle="tab">
                    Hard Body Parts
                  </a>
                </li>
                <li>
                  <a href={`#${TABS.notes}`} data-toggle="tab">
                    Notes
                  </a>
                </li>
              </ul>
              <div className="tab-content">
                <div className="tab-pane fade diet" id={TABS.diet}>
                  <div className="pull-right">
                    <DataGridAddDeleteButtons
                      addNew={addNewDiet}
                      deleteCurrent={deleteCurrentDiet}
                      deleteDisabled={selectedDietIndex === null}
                    />
                  </div>
                  <div style={{ clear: 'both' }}></div>
                  <DataGrid
                    data={diets}
                    onChangeItem={onDietChange}
                    columns={dietColumns}
                    hiddenColumns={hiddenDietColumns}
                    addNewRow={addNewDiet}
                    selectedRow={selectedDietIndex}
                    setSelectedRow={setSelectedDietIndex}
                  />
                </div>
                <div className="tab-pane fade" id={TABS.tags}>
                  {tags.map((tag, index) => (
                    <Tag
                      key={index}
                      state={tag}
                      onChange={(newValues) => onTagChange(fishId, index, newValues)}
                      addNew={addNewTag}
                      remove={() => removeTag(fishId, index)}
                      isLast={index === tags.length - 1}
                      isFirst={index === 0}
                    />
                  ))}
                </div>
                <div className="tab-pane fade" id={TABS.health}>
                  {health ? (
                    <Health
                      state={health}
                      onChange={(changes) =>
                        eventDispatch({
                          type: actionTypes.UPDATE_HEALTH,
                          payload: changes,
                          meta: fishId,
                        })
                      }
                    />
                  ) : null}
                </div>
                <div className="tab-pane fade hard-body-parts" id={TABS.collection}>
                  {/* part of health table */}
                  <DomainDrivenDropdown
                    featureServiceUrl={config.urls.healthFeatureService}
                    fieldName={config.fieldNames.health.COLLECTION_PART}
                    value={(health && health[config.fieldNames.health.COLLECTION_PART]) || ''}
                    onChange={(event) =>
                      eventDispatch({
                        type: actionTypes.UPDATE_HEALTH,
                        payload: {
                          ...health,
                          [config.fieldNames.health.COLLECTION_PART]: event.target.value,
                        },
                        meta: fishId,
                      })
                    }
                  />
                </div>
                <div className="tab-pane fade" id={TABS.notes}>
                  <textarea
                    className="form-control"
                    rows="5"
                    maxLength="250"
                    id="notesTxtArea"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary pull-right" onClick={() => setCurrentTab(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

MoreInfoDialog.propTypes = {
  fish: PropTypes.object,
  health: PropTypes.object,
  currentPass: PropTypes.number.isRequired,
  tags: PropTypes.array,
  diets: PropTypes.array,
};

export default MoreInfoDialog;
