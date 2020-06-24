import React, { memo } from 'react';
import { CardTab, RechartTool } from '@tencent/shared-components';
import { Space } from 'antd';

import QueryAdvertisingData from './QueryAdvertisingData';

import styles from './Details.module.less';

function AdvertisingTrendDetails(props) {
  return (
    <QueryAdvertisingData {...props} url="advertiser/trend" noSorterPagination>
      <Content />
    </QueryAdvertisingData>
  );
}
AdvertisingTrendDetails.displayName = 'AdvertisingTrendDetails';

/**
 * 这里使用 memo 做了浅层 props 对比，每次查询，这里只会渲染一次，深层的对比目前不是很必要。
 * 比较 dataSource 的数据是后端返回的，有时候渲染一次的速度并不会比对比慢多少，而且后端的数据还可能变化。
 */
const Content = memo(props => {
  const { result } = props;
  // dataAdater 之所以不放在 request 返回的函数中处理，是因为，两个查询组件公用了，不好区分。
  // 这里的适配算法时间复杂度为 O(n)，没必要使用 useMemo 进行处理，useMemo 的对比的算法时间复杂度都不止 O(n）。
  const dataSource = dataAdapter(result.serviceMedia);

  const tabList = [
    {
      key: 'exposure',
      tab: '曝光指数',
      content: <Chart data={dataSource.exposure} />,
    },

    {
      key: 'creativity',
      tab: '创意指数',
      content: <Chart data={dataSource.creativity} />,
    },
  ];

  return <CardTab tabList={tabList} bordered={false} />;
});

function Chart(props) {
  const { data } = props;
  return (
    <Space direction="vertical" className={styles.chartsContent} size="middle">
      <RechartTool data={data.pieChart} type="pie" title="整体占比" />
      <RechartTool data={data.lineChart} type="line" title="趋势" />
    </Space>
  );
}

function dataAdapter(data) {
  const obj = {
    // 曝光指数
    exposure: {
      pieChart: [{ label: true, chartData: [] }],
      lineChart: { dataKeys: [], chartData: [] },
    },
    // 创意指数
    creativity: {
      pieChart: [{ label: true, chartData: [] }],
      lineChart: { dataKeys: [], chartData: [] },
    },
  };

  data.forEach(d => {
    const { exposureNumSum, advCountSum } = d.data.reduce(
      (acc, cur, currentIndex) => {
        const {
          date,
          subItem: { exposureNum, advCount },
        } = cur;

        obj.exposure.lineChart.chartData[currentIndex] = {
          ...obj.exposure.lineChart.chartData[currentIndex],
          name: date,
          [d.title]: exposureNum,
        };

        obj.creativity.lineChart.chartData[currentIndex] = {
          ...obj.creativity.lineChart.chartData[currentIndex],
          name: date,
          [d.title]: advCount,
        };

        return {
          exposureNumSum: acc.exposureNumSum + exposureNum,
          advCountSum: acc.advCountSum + advCount,
        };
      },
      { exposureNumSum: 0, advCountSum: 0 }
    );
    obj.exposure.pieChart[0].chartData.push({
      name: d.title,
      value: exposureNumSum,
    });
    obj.creativity.pieChart[0].chartData.push({
      name: d.title,
      value: advCountSum,
    });
    obj.exposure.lineChart.dataKeys.push({
      name: d.title,
      dataKey: d.title,
    });
    obj.creativity.lineChart.dataKeys.push({
      name: d.title,
      dataKey: d.title,
    });
  });

  return obj;
}

export default AdvertisingTrendDetails;
