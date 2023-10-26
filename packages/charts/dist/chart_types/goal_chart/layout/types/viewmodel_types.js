"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullShapeViewModel = exports.nullGoalViewModel = exports.defaultGoalSpec = void 0;
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const constants_1 = require("../../../../specs/constants");
const light_theme_1 = require("../../../../utils/themes/light_theme");
const constants_2 = require("../../specs/constants");
const commonDefaults = {
    base: 0,
    actual: 50,
};
exports.defaultGoalSpec = {
    ...commonDefaults,
    bandFillColor: ({ value, highestValue, lowestValue }) => {
        return (0, color_library_wrappers_1.getGreensColorScale)(0.5, [highestValue, lowestValue])(value);
    },
    tickValueFormatter: ({ value }) => String(value),
    labelMajor: ({ base }) => String(base),
    labelMinor: () => 'unit',
    centralMajor: ({ base }) => String(base),
    centralMinor: ({ target }) => (target ? String(target) : ''),
    bandLabels: [],
    angleStart: Math.PI + Math.PI / 4,
    angleEnd: -Math.PI / 4,
    tooltipValueFormatter: (value) => String(value),
};
exports.nullGoalViewModel = {
    ...commonDefaults,
    specType: constants_1.SpecType.Series,
    subtype: constants_2.GoalSubtype.Goal,
    bands: [],
    ticks: [],
    labelMajor: '',
    labelMinor: '',
    centralMajor: '',
    centralMinor: '',
    highestValue: 100,
    lowestValue: 0,
    aboveBaseCount: 0,
    belowBaseCount: 0,
    angleStart: 0,
    angleEnd: 0,
    tooltipValueFormatter: () => '',
};
const nullShapeViewModel = ({ goal } = light_theme_1.LIGHT_THEME) => ({
    theme: goal,
    bulletViewModel: exports.nullGoalViewModel,
    chartCenter: { x: 0, y: 0 },
    pickQuads: () => [],
});
exports.nullShapeViewModel = nullShapeViewModel;
//# sourceMappingURL=viewmodel_types.js.map