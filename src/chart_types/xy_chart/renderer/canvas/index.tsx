// renderBrushTool = () => {
//   const { brushing, brushStart, brushEnd } = this.state;
//   const { chartDimensions, chartRotation, chartTransform } = this.props.chartStore!;
//   if (!brushing) {
//     return null;
//   }
//   let x = 0;
//   let y = 0;
//   let width = 0;
//   let height = 0;
//   // x = {chartDimensions.left + chartTransform.x};
//   // y = {chartDimensions.top + chartTransform.y};
//   if (chartRotation === 0 || chartRotation === 180) {
//     x = brushStart.x;
//     y = chartDimensions.top + chartTransform.y;
//     width = brushEnd.x - brushStart.x;
//     height = chartDimensions.height;
//   } else {
//     x = chartDimensions.left + chartTransform.x;
//     y = brushStart.y;
//     width = chartDimensions.width;
//     height = brushEnd.y - brushStart.y;
//   }
//   return <Rect x={x} y={y} width={width} height={height} fill="gray" opacity={0.6} />;
// };
