import React from 'react';
import { connect } from 'react-redux';
import { IChartState, PointerStore } from '../../store/chart_store';
import { isInitialized } from '../../store/selectors/is_initialized';
import { IndexedGeometry } from '../../utils/geometry';
import { getSettingsSpecSelector } from '../../store/selectors/get_settings_specs';
import { SettingsSpec } from '../../specs';
import { getHighlightedGeomsSelector } from 'chart_types/xy_chart/store/selectors/get_tooltip_values_highlighted_geoms';

interface Props {
  settings: SettingsSpec | undefined;
  indexedGeometries: IndexedGeometry[];
  pointer: PointerStore;
}
class OnClickElementListenersComponent extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    if (!nextProps.settings || !nextProps.settings.onElementClick || nextProps.indexedGeometries.length === 0) {
      return false;
    }
    const { pointer: prevPointer } = this.props;
    const { pointer: nextPointer } = nextProps;
    if (prevPointer.up === null && nextPointer.up !== null) {
      return true;
    }
    return false;
  }
  componentDidUpdate() {
    const { settings, indexedGeometries } = this.props;
    if (settings && settings.onElementClick) {
      settings.onElementClick(indexedGeometries.map(({ value }) => value));
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
      pointer: {
        down: null,
        up: null,
      },
    };
  }
  return {
    settings: getSettingsSpecSelector(state),
    indexedGeometries: getHighlightedGeomsSelector(state),
    pointer: state.interactions.pointer,
  };
};

export const OnClickElementListener = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OnClickElementListenersComponent);
