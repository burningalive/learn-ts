import React from 'react';
import { Avatar } from 'antd';
import { Link } from 'react-router-dom';

import getChannelUrl from '$utils/getChannelUrl';

export default function getColumns({ queryParams }) {
  function getQueryUrlStr(record) {
    const { dateType, date } = queryParams;
    const urlSearchParamsObj = new URLSearchParams({
      dateType,
      date,
    });
    return decodeURIComponent(urlSearchParamsObj.toString());
  }

  const columns = [
    {
      title: '店铺名称',
      fixed: 'left',
      dataIndex: 'shopName',
      key: 'shopName',
      render: (text, record) => {
        const href = `/tiktok/ecommerce/analysis/shop/${
          record.shopId
        }?${getQueryUrlStr(record)}`;

        return <Link to={href}>{text}</Link>;
      },
    },
    {
      title: '店铺来源',
      fixed: 'left',
      dataIndex: 'goodsSource',
      key: 'goodsSource',
      render(text) {
        return <Avatar shape="square" src={getChannelUrl(text)} size="small" />;
      },
    },
    {
      title: '商家热度',
      dataIndex: 'shopHeat',
      key: 'shopHeat',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '预估带货 GMV（元）',
      dataIndex: 'predictGmv',
      key: 'predictGmv',
      sorter: true,
      defaultSortOrder: 'descend',
      // format 执行后于 formatter
      format: 'shortNumber',
      formatter(value) {
        if (value < 0) {
          return '-';
        }

        return value / 100;
      },
    },
    {
      title: '商品数',
      sorter: true,
      key: 'productCount',
      dataIndex: 'productCount',
      format: 'shortNumber',
    },
    {
      title: '达人数',
      key: 'topManCount',
      dataIndex: 'topManCount',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '视频数',
      key: 'videoCount',
      dataIndex: 'videoCount',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '总曝光量',
      key: 'exposureCount',
      dataIndex: 'exposureCount',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '总销量',
      key: 'goodsSalesCount',
      dataIndex: 'goodsSalesCount',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '总点赞量',
      key: 'videoDiggCount',
      dataIndex: 'videoDiggCount',
      sorter: true,
      format: 'shortNumber',
    },
  ];
  return columns;
}
