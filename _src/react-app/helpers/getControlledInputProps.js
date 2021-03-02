export default function getControlledInputProps(eventState, eventDispatch, actionType, tableName, fieldName, parser) {
  return {
    className: 'form-control',
    onChange: (event) => {
      let newValue = event.target.value?.length ? event.target.value : null;
      if (newValue && parser) {
        newValue = parser(newValue);
      }

      return eventDispatch({
        type: actionType,
        meta: fieldName,
        payload: newValue,
      });
    },
    value: eventState[tableName].attributes[fieldName] || '',
  };
}
