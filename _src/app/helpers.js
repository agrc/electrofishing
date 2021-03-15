define([], function () {
  return {
    getNumericValue: function (value) {
      // summary:
      //      parses the input value into a numer or null
      console.log('app/helpers:getNumericValue', arguments);
      var int = parseFloat(value);

      return isNaN(int) ? null : int;
    },
  };
});
