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
class OnOutElementListenersComponent extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    if (!nextProps.settings || !nextProps.settings.onElementOut) {
      return false;
    }
    if (this.props.indexedGeometries.length > 0 && nextProps.indexedGeometries.length === 0) {
      return true;
    }
    return false;
  }
  componentDidUpdate() {
    const { settings } = this.props;
    if (settings && settings.onElementOut) {
      settings.onElementOut();
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

export const OnOutElementListener = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OnOutElementListenersComponent);
