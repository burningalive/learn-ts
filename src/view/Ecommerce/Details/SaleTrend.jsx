import React from 'react';
import { RechartTool } from '@tencent/shared-components';
import { Space } from 'antd';

import QueryDetailContainer from './QueryDetailContainer';

import styles from './Details.module.less';

function Trend(props) {
  return (
    <QueryDetailContainer
      {...props}
      url="merchant/saleTrend"
      noSorterPagination
      noAdvFormat
    >
      <Content />
    </QueryDetailContainer>
  );
}
Trend.displayName = 'Trend';

function Content(props) {
  const { result } = props;
  const dataSource = dataAdapter(result.saleVolumeTrend);
  return <Chart data={dataSource.saleVolume} />;
}

function Chart(props) {
  const { data } = props;
  return (
    <Space direction="vertical" className={styles.chartsContent} size="middle">
      <RechartTool data={data.lineChart} type="line" title="销量趋势" />
    </Space>
  );
}

function dataAdapter(data) {
  const obj = {
    // 曝光指数
    saleVolume: {
      lineChart: { dataKeys: [], chartData: [] },
    },
  };

  data.forEach(d => {
    d.data.forEach((cur, currentIndex) => {
      const {
        date,
        subItem: { saleVolume },
      } = cur;

      obj.saleVolume.lineChart.chartData[currentIndex] = {
        ...obj.saleVolume.lineChart.chartData[currentIndex],
        name: date,
        [d.title]: saleVolume,
      };
    });

    obj.saleVolume.lineChart.dataKeys.push({
      name: d.title,
      dataKey: d.title,
    });
  });

  return obj;
}

export default Trend;
