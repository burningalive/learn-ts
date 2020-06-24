import React, { useMemo } from 'react';
import { AdvancedTable, RechartTool } from '@tencent/shared-components';
import isNumber from '@tencent/shared-utils/lib/type/isNumber';

import styles from './index.module.less';

function MediaDrop(props) {
  const columns = [
    {
      // 自定义数据
      title: '媒体',
      fixed: 'left',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '首页总资讯PV (万)',
      dataIndex: 'sumPv',
      key: 'sumPv',
      sorter: true,
      format: 'thousandSemicolon',
      formatter(value) {
        return (value / 10000).toFixed(0);
      },
    },
    {
      title: '广告主数',
      dataIndex: 'adverNum',
      key: 'adverNum',
      format: 'thousandSemicolon',
      sorter: true,
    },
    {
      title: '广告数',
      dataIndex: 'adNum',
      key: 'adNum',
      format: 'thousandSemicolon',
      sorter: true,
    },
    {
      // 自定义数据，需要计算
      title: '广告主覆盖度',
      key: 'adverCoverage',
      dataIndex: 'adverCoverage',
      format: 'percent',
      sorter: true,
    },
    {
      title: '广告覆盖度',
      key: 'adCoverage',
      dataIndex: 'adCoverage',
      format: 'percent',
      sorter: true,
    },
    {
      title: 'adload',
      key: 'adload',
      dataIndex: 'adload',
      format: 'percent',
      render(text, record) {
        if (record.title === '快手') {
          // 快手固定为 3.00%
          return '3.00%';
        }
        return text;
      },
      sorter: true,
    },
    {
      title: '首页广告PV (万)',
      key: 'adPv',
      dataIndex: 'adPv',
      format: 'thousandSemicolon',
      formatter(value) {
        return (value / 10000).toFixed(0);
      },
      sorter: true,
    },
    {
      // 需要计算
      title: '首页ECPM',
      key: 'ecpm',
      dataIndex: 'ecpm',
      format: 'thousandSemicolon',
      sorter: true,
    },
    {
      title: '首页消耗 (万)',
      key: 'consumption',
      dataIndex: 'consumption',
      format: 'thousandSemicolon',
      formatter(value) {
        return (value / 10000).toFixed(0);
      },
      sorter: true,
    },
    {
      // 需要计算
      title: '产品总消耗预估 (万)',
      width: 170,
      key: 'consumptionSum',
      dataIndex: 'consumptionSum',
      format: 'thousandSemicolon',
      sorter: true,
    },
  ];
  const { mediaData, dataFlow, adloadFlow } = props;
  const dropTableDataSource = useMemo(() => {
    return mediaDataAdapter(mediaData);
  }, [mediaData]);
  const dataFlowDataSource = useMemo(() => {
    return dataFlowAdapter(dataFlow);
  }, [dataFlow]);
  const adloadFlowDataSource = useMemo(() => {
    return dataFlowAdapter(adloadFlow);
  }, [adloadFlow]);

  return (
    <>
      <AdvancedTable
        rowKey="title"
        bordered
        dataSource={dropTableDataSource}
        columns={columns}
        toolBar={{ reload: false }}
        title="摘要数据"
      />
      <RechartTool
        className={styles.adverChart}
        data={dataFlowDataSource}
        type="line"
        title="每日统计（广告主数）"
      />

      <RechartTool
        className={styles.adloadChart}
        data={adloadFlowDataSource}
        type="line"
        yAxisFormat="percent(2)"
        title="每日统计（adload）"
      />
    </>
  );
}
MediaDrop.displayName = 'MediaDrop';

/**
 * 每日统计（广告主数 ）
 */
function dataFlowAdapter(dataFlow) {
  // 百度、快手等
  const category = {};
  const chartData = [];
  const dataKeys = [];

  dataFlow.forEach(v => {
    category[v.date[0].title] = v.date;
  });

  Object.keys(category).forEach(key => {
    // key 的值是中文，即 title
    dataKeys.push({
      dataKey: key,
      name: key,
    });

    category[key].forEach((c, index) => {
      if (!chartData[index]) {
        chartData[index] = {};
      }

      chartData[index].name = c.dayStr;
      // key 当做数据源字段，这里的数据是中文。
      chartData[index][key] = c.adverExposureNum;
    });
  });

  return {
    dataKeys,
    chartData,
  };
}

function mediaDataAdapter(mediaData) {
  const dropTableDataSource = [];

  mediaData.forEach(d => {
    const { title, sumPv, adverNum, adNum, adload, adPv, consumption } = d;
    // 下面的字段需要计算
    // eslint-disable-next-line
    let { adverCoverage, adCoverage, ecpm, consumptionSum } = d;

    (() => {
      if (isNumber(adverNum)) {
        // 广告主覆盖度
        if (title === '抖音') {
          adverCoverage = ((adverNum / 4600) * 100).toFixed(0);
          if (adverCoverage > 100) {
            adverCoverage = '99%';
          } else {
            adverCoverage += '%';
          }
        } else {
          adverCoverage = ((adverNum / 4100) * 100).toFixed(0);
          if (adverCoverage > 100) {
            adverCoverage = '99%';
          } else {
            adverCoverage += '%';
          }
        }
      }
    })();
    (() => {
      // 广告覆盖度
      if (isNumber(adverNum)) {
        if (title === '抖音') {
          adCoverage = ((adNum / 19090) * 100).toFixed(0);
          if (adCoverage > 100) {
            adCoverage = '99%';
          } else {
            adCoverage += '%';
          }
        } else {
          adCoverage = ((adNum / 17015) * 100).toFixed(0);
          if (adCoverage > 100) {
            adCoverage = '99%';
          } else {
            adCoverage += '%';
          }
        }
      }
    })();
    (() => {
      if (isNumber(consumption)) {
        // 产品总消耗预估
        if (consumption !== undefined && consumption !== null) {
          if (title === '今日头条' || title === '百度') {
            consumptionSum = (consumption / 10000 / 0.4).toFixed(0);
          } else {
            consumptionSum = (consumption / 10000).toFixed(0);
          }
        }
      }
    })();
    (() => {
      // 首页 ecpm
      if (isNumber(consumption) && isNumber(adPv)) {
        if (
          consumption !== undefined &&
          consumption !== null &&
          adPv !== undefined &&
          adPv !== null
        ) {
          if (title === '百度贴吧') {
            ecpm = ((consumption / adPv) * 1000 * 0.7).toFixed(2);
          } else {
            ecpm = ((consumption / adPv) * 1000).toFixed(2);
          }
        }
      }
    })();

    dropTableDataSource.push({
      title,
      sumPv,
      adverNum,
      adNum,
      adload,
      adPv,
      consumption,
      adverCoverage,
      adCoverage,
      ecpm,
      consumptionSum,
    });
  });
  return dropTableDataSource;
}

export default MediaDrop;
