import React, { useMemo } from 'react';
import { AdvancedTable } from '@tencent/shared-components';

function MediaProduct(props) {
  const columns = [
    {
      title: '媒体',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '月活跃用户数 (万人)',
      dataIndex: 'monthlyUserNum',
      key: 'monthlyUserNum',
      format: 'thousandSemicolon',
      formatter(value) {
        return (value / 10000).toFixed(0);
      },
      sorter: true,
    },
    {
      title: '日均活跃用户数 (万人)',
      key: 'dailyUserNum',
      dataIndex: 'dailyUserNum',
      format: 'thousandSemicolon',
      formatter(value) {
        return (value / 10000).toFixed(0);
      },
      sorter: true,
    },
    {
      title: '人均活跃时长 (分钟)',
      key: 'dailyAvgActime',
      dataIndex: 'dailyAvgActime',
      format: 'thousandSemicolon',
      sorter: true,
    },
    {
      title: '人均资讯条数',
      key: 'perUserCapita',
      dataIndex: 'perUserCapita',
      format: 'thousandSemicolon',
      sorter: true,
    },
    {
      title: '首页总资讯PV (万)',
      key: 'sumPv',
      dataIndex: 'sumPv',
      format: 'thousandSemicolon',
      formatter(value) {
        return (value / 10000).toFixed(0);
      },
      sorter: true,
    },
  ];
  const { mediaData } = props;
  const productTableDataSource = useMemo(() => {
    return mediaDataAdapter(mediaData);
  }, [mediaData]);

  return (
    <AdvancedTable
      rowKey="title"
      dataSource={productTableDataSource}
      columns={columns}
      toolBar={{ reload: false }}
      title="产品数据"
    />
  );
}
MediaProduct.displayName = 'MediaProduct';

function mediaDataAdapter(mediaData) {
  const dropTableDataSource = [];

  mediaData.forEach(d => {
    const {
      title,
      monthlyUserNum,
      dailyUserNum,
      dailyAvgActime,
      perUserCapita,
      sumPv,
    } = d;

    dropTableDataSource.push({
      title,
      monthlyUserNum,
      dailyUserNum,
      dailyAvgActime,
      perUserCapita,
      sumPv,
    });
  });
  return dropTableDataSource;
}

export default MediaProduct;
