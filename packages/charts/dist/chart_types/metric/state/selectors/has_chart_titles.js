"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasChartTitles = void 0;
const can_display_chart_titles_1 = require("./can_display_chart_titles");
const create_selector_1 = require("../../../../state/create_selector");
const getChartTitleOrDescription = ({ title, description }) => Boolean(title || description);
exports.hasChartTitles = (0, create_selector_1.createCustomCachedSelector)([can_display_chart_titles_1.canDisplayChartTitles, getChartTitleOrDescription], (displayTitles, hasTitles) => {
    return displayTitles && hasTitles;
});
//# sourceMappingURL=has_chart_titles.js.map