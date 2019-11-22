import { useEffect, useRef } from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { upsertSpec, removeSpec } from './actions/specs';
import { Spec } from '../specs';

export interface DispatchProps {
  upsertSpec: (spec: Spec) => void;
  removeSpec: (id: string) => void;
}

function usePrevious(value: string) {
  const ref = useRef<string>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function specComponentFactory<U extends Spec, D extends keyof U>(
  defaultProps: Pick<U, D | 'chartType' | 'specType'>,
) {
  const spec = (props: U & DispatchProps) => {
    const prevId = usePrevious(props.id);
    const { removeSpec, upsertSpec, ...spec } = props;
    useEffect(() => {
      // console.log('updating specs');
      if (prevId && prevId !== props.id) {
        // console.log('remove existing specs, ', prevId);
        removeSpec(prevId);
      }
      upsertSpec(spec);
    });
    useEffect(
      () => () => {
        // console.log('remove spec on unmount', props.id);
        removeSpec(props.id);
      },
      [],
    );
    return null;
  };
  spec.defaultProps = defaultProps;
  return spec;
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      upsertSpec,
      removeSpec,
    },
    dispatch,
  );

export function getConnect() {
  return connect(
    null,
    mapDispatchToProps,
  );
}
