import React from 'react';
import { CardTab, RechartTool } from '@tencent/shared-components';
import { Space } from 'antd';

import QueryDetailContainer from './QueryDetailContainer';

import styles from './Details.module.less';

function Trend(props) {
  return (
    <QueryDetailContainer {...props} url="merchant/trend" noSorterPagination>
      <Content />
    </QueryDetailContainer>
  );
}
Trend.displayName = 'Trend';

function Content(props) {
  const { result } = props;
  const dataSource = dataAdapter(result.serviceMedia);

  const tabList = [
    {
      key: 'exposure',
      tab: '曝光指数',
      content: <Chart data={dataSource.exposure} />,
    },
  ];

  return <CardTab tabList={tabList} type="inner" />;
}

function Chart(props) {
  const { data } = props;
  return (
    <Space direction="vertical" className={styles.chartsContent} size="middle">
      <RechartTool data={data.lineChart} type="line" />
    </Space>
  );
}

function dataAdapter(data) {
  const obj = {
    // 曝光指数
    exposure: {
      lineChart: { dataKeys: [], chartData: [] },
    },
  };

  data.forEach(d => {
    d.data.forEach((cur, currentIndex) => {
      const {
        date,
        subItem: { exposureNum },
      } = cur;

      obj.exposure.lineChart.chartData[currentIndex] = {
        ...obj.exposure.lineChart.chartData[currentIndex],
        name: date,
        [d.title]: exposureNum,
      };
    });

    obj.exposure.lineChart.dataKeys.push({
      name: d.title,
      dataKey: d.title,
    });
  });

  return obj;
}

export default Trend;
