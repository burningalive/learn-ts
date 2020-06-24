import React from 'react';
import { Space, Tooltip, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { QuestionCircleOutlined } from '@ant-design/icons';

import addPlusForPositiveNumber from '$utils/addPlusForPositiveNumber';

const Text = Typography.Text;

function amplitudeFormatter(value) {
  const text = `${addPlusForPositiveNumber(Number(value).toFixed(0))}%`;

  if (Number(value) > 100) {
    return <Text type="danger">{text}</Text>;
  }

  return text;
}

export default function getColumns({ queryParams }) {
  function getQueryUrlStr(record) {
    const { dateType, date } = queryParams;
    const urlSearchParamsObj = new URLSearchParams({
      date,
      dateType,
      productType: [
        record.industryNameId,
        // 由于 url 字符串值需要使用 `,` 分割才会识别为数组类型
        // 所以这里要有一个空字符串
        '',
      ].join(','),
    });
    return decodeURIComponent(urlSearchParamsObj.toString());
  }

  const columns = [
    {
      title: '行业名称',
      fixed: 'left',
      dataIndex: 'industryName',
      key: 'industryName',
      render: (text, record) => {
        const href = `/tiktok/ecommerce/analysis/product?${getQueryUrlStr(
          record
        )}`;
        return (
          // eslint-disable-next-line react/jsx-no-target-blank
          <Link to={href}>{text}</Link>
        );
      },
    },
    {
      title: '商家数',
      dataIndex: 'shopNum',
      key: 'shopNum',
      sorter: true,
      format: 'shortNumber',
      render: (text, record) => {
        return <>{`${text}(${addPlusForPositiveNumber(record.shopNumInc)})`}</>;
      },
    },
    {
      title: '商品数',
      dataIndex: 'goodsNum',
      key: 'goodsNum',
      sorter: true,
      format: 'shortNumber',
      render: (text, record) => {
        return (
          <>{`${text}(${addPlusForPositiveNumber(record.goodsNumInc)})`}</>
        );
      },
    },
    {
      title: '关联播主数',
      dataIndex: 'broadcaster',
      key: 'broadcaster',
      sorter: true,
      format: 'shortNumber',
      render: (text, record) => {
        return (
          <>{`${text}(${addPlusForPositiveNumber(record.broadcasterInc)})`}</>
        );
      },
    },
    {
      title: '关联视频数',
      dataIndex: 'videoNum',
      key: 'videoNum',
      sorter: true,
      format: 'shortNumber',
      render: (text, record) => {
        return (
          <>{`${text}(${addPlusForPositiveNumber(record.videoNumInc)})`}</>
        );
      },
    },
    {
      title: '商品曝光量增量',
      sorter: true,
      key: 'goodsExpInc',
      format: 'shortNumber',
      dataIndex: 'goodsExpInc',
      defaultSortOrder: 'descend',
    },
    {
      title: '曝光量变化幅度',
      key: 'goodsExpIncChainGrowthRate',
      dataIndex: 'goodsExpIncChainGrowthRate',
      sorter: true,
      formatter: amplitudeFormatter,
    },
    {
      showSorterTooltip: false,
      title: (
        <Space>
          <span>全网销售增量</span>
          <Tooltip
            title={
              <div>
                <div>全网销量增量按照日期的环比来计算</div>
                <div>淘宝商品销量为该商品近30天的淘宝总销量</div>
                <div>好货商品销量为该商品当日累积总销量</div>
              </div>
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </Space>
      ),
      key: 'saleCountInc',
      dataIndex: 'saleCountInc',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '销量变化幅度',
      key: 'saleCountIncChainGrowthRate',
      dataIndex: 'saleCountIncChainGrowthRate',
      sorter: true,
      formatter: amplitudeFormatter,
    },
  ];
  return columns;
}
