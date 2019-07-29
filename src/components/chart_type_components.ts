import React from 'react';
import { connect } from 'react-redux';
import { IChartState } from 'store/chart_store';
import { isInitialized } from 'store/selectors/is_initialized';
import { getChartTypeComponentSelector } from 'store/selectors/get_chart_type_components';

interface OwnProps {
  zIndex: number;
  type: 'dom' | 'svg' | 'canvas';
}
interface Props {
  components: JSX.Element | null;
}
class ExtraComponents extends React.Component<Props> {
  static displayName = 'ExtraComponents';

  render() {
    return this.props.components;
  }
}

const mapDispatchToProps = () => ({});
const mapStateToProps = (state: IChartState, ownProps: OwnProps) => {
  if (!isInitialized(state)) {
    return {
      components: null,
    };
  }
  return {
    components: getChartTypeComponentSelector(ownProps.zIndex, ownProps.type)(state),
  };
};

export const ChartTypeComponents = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExtraComponents);
