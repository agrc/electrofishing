import React from 'react';
import config from '../../config';
import DataGrid, { DomainDrivenDropdownCell, NumericInputCell } from '../DataGrid.jsx';
import GridTab from '../GridTab.jsx';
import { actionTypes, getBlankFish, useSamplingEventContext } from '../../hooks/samplingEventContext.jsx';
import papaparse from 'papaparse/papaparse';
import { toast } from 'react-toastify';
import MoreInfoDialog from './MoreInfoDialog.jsx';
import DataGridAddDeleteButtons from '../DataGridAddDeleteButtons.jsx';
import { getLastFishIdsWithEmptyWeights, batchFishWeights } from './batchUtils';

const fn = config.fieldNames.fish;
const hiddenColumns = [fn.FISH_ID, fn.PASS_NUM, fn.NOTES];
const columns = [
  { accessorKey: fn.FISH_ID },
  { accessorKey: fn.PASS_NUM, filterFn: 'equals' },
  { accessorKey: fn.NOTES },
  { header: 'ID', accessorKey: fn.CATCH_ID },
  {
    header: 'Species Code',
    accessorKey: fn.SPECIES_CODE,
    cell: DomainDrivenDropdownCell,
    meta: {
      dropdownProps: {
        fieldName: fn.SPECIES_CODE,
        featureServiceUrl: config.urls.fishFeatureService,
      },
    },
  },
  {
    header: 'Length Type',
    accessorKey: fn.LENGTH_TYPE,
    cell: DomainDrivenDropdownCell,
    meta: {
      dropdownProps: {
        fieldName: fn.LENGTH_TYPE,
        featureServiceUrl: config.urls.fishFeatureService,
      },
    },
  },
  {
    header: 'Length (millimeters)',
    accessorKey: fn.LENGTH,
    cell: NumericInputCell,
    meta: {
      inputProps: {
        min: 0,
      },
    },
  },
  {
    header: 'Weight (grams)',
    accessorKey: fn.WEIGHT,
    cell: NumericInputCell,
    meta: {
      inputProps: {
        min: 0,
        step: 0.1,
      },
    },
  },
  {
    header: 'Count',
    accessorKey: fn.COUNT,
    cell: NumericInputCell,
    meta: {
      inputProps: {
        min: 1,
      },
    },
  },
];

function Catch() {
  const {
    eventState: {
      [config.tableNames.fish]: fishes,
      [config.tableNames.samplingEvents]: {
        attributes: {
          [config.fieldNames.samplingEvents.NUM_PASSES]: numPasses,
          [config.fieldNames.samplingEvents.EVENT_ID]: eventId,
        },
      },
      [config.tableNames.health]: healths,
      [config.tableNames.tags]: tags,
      [config.tableNames.diet]: diets,
    },
    eventDispatch,
  } = useSamplingEventContext();
  const [currentPass, setCurrentPass] = React.useState(1);

  const visibleFishes = fishes.filter((fish) => fish[fn.PASS_NUM] === currentPass);
  const batchWeightFishIds = getLastFishIdsWithEmptyWeights(visibleFishes);
  const batchWeightingIsAvailable = batchWeightFishIds.length > 1;

  const onFishChange = (rowIndex, columnId, newValue) => {
    eventDispatch({
      type: actionTypes.UPDATE_FISH,
      payload: {
        [columnId]: newValue,
      },
      meta: fishes[rowIndex][fn.FISH_ID],
    });
  };

  const addFish = () =>
    eventDispatch({
      type: actionTypes.ADD_FISH,
      payload: currentPass,
    });

  const [selectedFishId, setSelectedFishId] = React.useState(null);

  const deleteCurrentFish = () => {
    if (selectedFishId) {
      eventDispatch({
        type: actionTypes.REMOVE_FISH,
        payload: selectedFishId,
      });
      setSelectedFishId(null);
    }
  };

  const batchWeightInput = React.useRef();
  const submitBatchFishWeights = React.useCallback(() => {
    const newFishes = batchFishWeights(fishes, currentPass, batchWeightInput.current.valueAsNumber);

    eventDispatch({
      type: actionTypes.FISHES,
      payload: newFishes,
    });
  }, [batchWeightInput, currentPass, eventDispatch, fishes]);

  const batchForm = React.useRef();
  const batchButton = React.useRef();
  const batchSubmitButton = React.useRef();
  React.useEffect(() => {
    $(batchButton.current).popover({
      html: true,
      content: batchForm.current,
      placement: 'bottom',
      container: 'body',
      sanitize: false,
    });
  }, []);

  React.useEffect(() => {
    // this needs to be done via ref since the popover messes with the JSX dom events
    batchSubmitButton.current.onclick = () => {
      submitBatchFishWeights();
      batchWeightInput.current.value = '';
      $(batchButton.current).popover('hide');
    };
  }, [submitBatchFishWeights]);

  const bulkUploadHelp = React.useRef();
  const bulkUploadHelpContent = React.useRef();
  React.useEffect(() => {
    $(bulkUploadHelp.current).popover({
      html: true,
      content: bulkUploadHelpContent.current,
      sanitize: false,
      placement: 'left',
    });
  }, []);

  const onBulkUploadClick = (event) => {
    const fileInput = event.target;

    papaparse.parse(fileInput.files[0], {
      complete: bulkUpload,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    // clear files so that the onchange event fires again if they upload the same file
    fileInput.value = '';
  };

  const bulkUpload = (parseResults) => {
    // parseResults: Result Object returned from papaparse.parse

    if (parseResults.errors.length) {
      console.error(JSON.stringify(parseResults.errors));
      toast.error('Error parsing CSV: ' + parseResults.errors.map((e) => e.message).join('\n'));

      return;
    }

    // remove the last row if it's blank
    let lastFish = visibleFishes[visibleFishes.length - 1];
    const fields = [fn.SPECIES_CODE, fn.LENGTH_TYPE, fn.LENGTH, fn.WEIGHT];
    if (lastFish && fields.every((field) => lastFish[field] === null)) {
      eventDispatch({
        type: actionTypes.REMOVE_FISH,
        payload: lastFish[fn.FISH_ID],
      });
      lastFish = visibleFishes[visibleFishes.length - 2];
    }

    const startId = lastFish[fn.CATCH_ID] + 1;
    const newFish = parseResults.data.map((data, i) => {
      return {
        ...getBlankFish(),
        [fn.EVENT_ID]: eventId,
        [fn.PASS_NUM]: currentPass,
        [fn.CATCH_ID]: i + startId,
        ...data,
      };
    });

    eventDispatch({
      type: actionTypes.FISHES,
      payload: [...fishes, ...newFish],
    });
  };

  const selectedFishIndex = fishes.findIndex((fish) => fish[fn.FISH_ID] === selectedFishId);
  const health = healths.find((h) => h[config.fieldNames.health.FISH_ID] === selectedFishId);
  const tagsForThisFish = tags.filter((t) => t[fn.FISH_ID] === selectedFishId);
  const dietsForThisFish = diets.filter((d) => d[fn.FISH_ID] === selectedFishId);

  return (
    <div className="catch">
      <GridTab
        name="Pass"
        numTabs={numPasses}
        addTab={() => {
          eventDispatch({
            type: actionTypes.ADD_PASS,
          });
          setSelectedFishId(null);
        }}
        currentTab={currentPass}
        setCurrentTab={setCurrentPass}
      />

      <div className="btn-right-container pull-right btn-toolbar">
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-info btn-warning"
            data-toggle="popover"
            ref={batchButton}
            disabled={!batchWeightingIsAvailable}
          >
            Batch
          </button>
        </div>
        <DataGridAddDeleteButtons
          addNew={addFish}
          deleteCurrent={deleteCurrentFish}
          deleteDisabled={selectedFishId === null}
        />
      </div>

      <MoreInfoDialog
        fish={fishes[selectedFishIndex]}
        health={health}
        tags={tagsForThisFish}
        diets={dietsForThisFish}
        currentPass={currentPass}
      />

      <DataGrid
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={fishes}
        onChangeItem={onFishChange}
        filter={{ field: fn.PASS_NUM, value: currentPass }}
        addNewRow={addFish}
        selectedRow={selectedFishIndex}
        boldRows={fishes
          .map((fish, i) => [fish.moreInfo, i])
          .filter(([moreInfo]) => moreInfo)
          .map(([, originalIndex]) => originalIndex)}
        setSelectedRow={(index) => setSelectedFishId(fishes[index][fn.FISH_ID])}
        highlight={(fish, column) => column === fn.WEIGHT && batchWeightFishIds.includes(fish[fn.FISH_ID])}
      />

      <div className="bulk-upload-container pull-right">
        <button className="btn btn-link" data-toggle="popover" ref={bulkUploadHelp}>
          help
        </button>
        <label className="btn btn-default btn-file">
          Bulk Upload
          <input type="file" onChange={onBulkUploadClick} />
        </label>
      </div>

      <div className="hidden">
        <div ref={batchForm}>
          <div className="form-group">
            <label className="control-label">Weight</label>
            <input type="number" className="form-control" step="0.1" ref={batchWeightInput} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} ref={batchSubmitButton}>
            Go
          </button>
        </div>
        <div ref={bulkUploadHelpContent}>
          File format must be CSV and contain the following headers (in no particular order):
          <ul>
            <li>{fn.SPECIES_CODE}</li>
            <li>{fn.LENGTH_TYPE}</li>
            <li>{fn.LENGTH}</li>
            <li>{fn.WEIGHT}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Catch;
