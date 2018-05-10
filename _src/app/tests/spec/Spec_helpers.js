require([
    'app/helpers'
], function (helpers) {
    describe('app/helpers', function () {
        describe('getNumericValue', function () {
            it('returns null for empty strings', function () {
                expect(helpers.getNumericValue('')).toBeNull();
            });
            it('returns numeric values', function () {
                expect(helpers.getNumericValue('3')).toBe(3);
                expect(helpers.getNumericValue('3.1')).toBe(3.1);
            });
        });
    });
});
