import React from 'react';
import { RechartTool } from '@tencent/shared-components';
import { Space } from 'antd';

import QueryDetailContainer from './QueryDetailContainer';

import styles from './Details.module.less';

function ExposureDistribution(props) {
  return (
    <QueryDetailContainer
      {...props}
      url="merchant/goodsAera"
      noAdvFormat
      noSorterPagination
    >
      <Content />
    </QueryDetailContainer>
  );
}
ExposureDistribution.displayName = 'ExposureDistribution';

function Content(props) {
  const { result } = props;
  const dataSource = dataAdapter(result.exposureTerritory);

  return <Chart data={dataSource.exposure} />;
}

function Chart(props) {
  const { data } = props;
  return (
    <Space direction="vertical" className={styles.chartsContent} size="middle">
      <RechartTool data={data.pieChart} type="pie" title="曝光地域分布" />
    </Space>
  );
}

function dataAdapter(data) {
  const obj = {
    // 曝光指数
    exposure: {
      pieChart: [{ label: true, chartData: [] }],
    },
  };

  data.forEach(d => {
    obj.exposure.pieChart[0].chartData.push({
      name: d.name,
      value: d.value,
    });
  });

  return obj;
}

export default ExposureDistribution;
