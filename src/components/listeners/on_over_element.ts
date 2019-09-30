import React from 'react';
import { connect } from 'react-redux';
import { IChartState } from '../../store/chart_store';
import { isInitialized } from '../../store/selectors/is_initialized';
import { IndexedGeometry } from '../../utils/geometry';
import { getSettingsSpecSelector } from '../../store/selectors/get_settings_specs';
import { SettingsSpec } from '../../specs';
import { getHighlightedGeomsSelector } from 'chart_types/xy_chart/store/selectors/get_tooltip_values_highlighted_geoms';

interface Props {
  settings: SettingsSpec | undefined;
  indexedGeometries: IndexedGeometry[];
}
class OnOverElementListenersComponent extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    if (!nextProps.settings || !nextProps.settings.onElementOver) {
      return false;
    }
    const { indexedGeometries: nextGeomValues } = nextProps;
    const { indexedGeometries: prevGeomValues } = this.props;
    if (nextGeomValues.length > 0) {
      if (nextGeomValues.length !== prevGeomValues.length) {
        return true;
      }
      return !nextGeomValues.every(({ value: next }, index) => {
        const prev = prevGeomValues[index].value;
        return prev && prev.x === next.x && prev.y === next.y && prev.accessor === next.accessor;
      });
    }

    return false;
  }
  componentDidUpdate() {
    const { settings, indexedGeometries } = this.props;
    if (settings && settings.onElementOver) {
      settings.onElementOver(indexedGeometries.map(({ value }) => value));
    }
  }
  render() {
    return null;
  }
}

const mapDispatchToProps = () => ({});
const mapStateToProps = (state: IChartState) => {
  if (!isInitialized(state)) {
    return {
      settings: undefined,
      indexedGeometries: [],
    };
  }
  return {
    settings: getSettingsSpecSelector(state),
    indexedGeometries: getHighlightedGeomsSelector(state),
  };
};

export const OnOverElementListener = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OnOverElementListenersComponent);
