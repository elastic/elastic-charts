import { SunburstSpec } from '../../specs/sunburst_spec';
import { Dimensions } from '../../../../utils/dimensions';
import { config } from '../../layout/circline/config/config';
import { Config } from '../../layout/circline/types/ConfigTypes';
import { shapeViewModel } from '../../layout/circline/viewModel/viewModel';
import { measureText } from '../../layout/circline/utils/measure';
import { dimensionValues, rawTextGetterFn, rawValueGetterFn } from '../../layout/dataProcessing';
import { sunburstMockConfig } from '../../layout/mocks/mockConfigs';
import { ShapeViewModel } from '../../layout/circline/types/ViewModelTypes';
import { Theme } from '../../../../utils/themes/theme';

export function render(sunburstSpec: SunburstSpec, parentDimensions: Dimensions, theme: Theme): ShapeViewModel {
  const { width, height } = parentDimensions;
  // eslint-disable-next-line no-console
  console.log(theme);
  const playgroundConfig030 = (): Config =>
    Object.assign({}, config, {
      viewQuery: sunburstMockConfig,
      width,
      height,
      colors: 'CET2s',
      linkLabel: Object.assign({}, config.linkLabel, {
        maxCount: 32,
        fontSize: 14,
      }),
      fontFamily: 'Arial',
      fillLabel: Object.assign({}, config.fillLabel, {
        formatter: (d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`,
        fontStyle: 'italic',
      }),
      margin: Object.assign({}, config.margin, { top: 0, bottom: 0, left: 0, right: 0 }),
      minFontSize: 1,
      idealFontSizeJump: 1.1,
      outerSizeRatio: 0.9, // - 0.5 * Math.random(),
      emptySizeRatio: sunburstSpec.donut ? 0.4 : 0,
      circlePadding: 4,
      backgroundColor: 'rgba(229,229,229,1)',
    });
  const facts = sunburstSpec.data;
  const textMeasurer = document.createElement('canvas');
  const textMeasurerCtx = textMeasurer.getContext('2d');
  const myConfig = playgroundConfig030();
  const viewModel =
    textMeasurerCtx &&
    shapeViewModel(
      measureText(textMeasurerCtx),
      myConfig,
      facts,
      rawTextGetterFn(dimensionValues(myConfig.viewQuery)),
      rawValueGetterFn(/*dimensionValues(myConfig.viewQuery)*/),
    );
  const sectorViewModel = viewModel ? viewModel.sectorViewModel : [];
  const rowSets = viewModel ? viewModel.rowSets : [];
  const linkLabelViewModels = viewModel ? viewModel.linkLabelViewModels : [];
  const outsideLinksViewModel = viewModel ? viewModel.outsideLinksViewModel : [];
  const diskCenter = viewModel ? viewModel.diskCenter : { x: width / 2, y: height / 2 };
  return { config: myConfig, sectorViewModel, rowSets, linkLabelViewModels, outsideLinksViewModel, diskCenter };
}
