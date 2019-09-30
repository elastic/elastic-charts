import { connect } from 'react-redux';
import { useEffect } from 'react';
import { specParsed, specUnmounted } from '../store/actions/specs';
import { bindActionCreators, Dispatch } from 'redux';

export const SpecsParserComponent: React.FunctionComponent<{}> = (props) => {
  const injected = props as DispatchProps;
  useEffect(() => {
    injected.specParsed();
  });
  useEffect(
    () => () => {
      injected.specUnmounted();
    },
    [],
  );
  return props.children ? (props.children as React.ReactElement) : null;
};

interface DispatchProps {
  specParsed: () => void;
  specUnmounted: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      specParsed,
      specUnmounted,
    },
    dispatch,
  );

const mapStateToProps = () => ({});

export const SpecsParser = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SpecsParserComponent);
