import React from 'react';
import { Space, Tooltip, Typography, Avatar, Popover } from 'antd';
import { LineChartOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { LineChart } from '@tencent/shared-components';

import LogoTitle from '$components/LogoTitle';
import ShopInfo from '$components/ShopInfo';
import platform from '$utils/platform';

import styles from './index.module.less';

const Text = Typography.Text;

export default function getColumns({ queryParams }) {
  function getQueryUrlStr(record) {
    const { dateType, date } = queryParams;
    const urlSearchParamsObj = new URLSearchParams({
      dateType,
      date,
      goodsType: 'goods-analysis',
    });
    return decodeURIComponent(urlSearchParamsObj.toString());
  }

  const columns = [
    {
      title: '商品',
      fixed: 'left',
      dataIndex: 'goodsTitle',
      key: 'goodsTitle',
      className: styles.goodsTitle,
      wrap: true,
      render: (text, record) => {
        const { goodsUrlPicturesPath, goodsSource, goodsOnListCount } = record;
        const href = `/tiktok/ecommerce/analysis/product/${
          record.goodsId
        }?${getQueryUrlStr(record)}`;
        return (
          <LogoTitle
            src={goodsUrlPicturesPath}
            href={href}
            title={
              <>
                <span>{text}</span>
                <Avatar
                  className={styles.logo}
                  src={platform[goodsSource]}
                  shape="square"
                  size="small"
                />
                <span>
                  {
                    // 直接 `goodsOnLinst &&` 判断会展示为 0，会有一个比较奇怪的问题
                    goodsOnListCount !== 0 && goodsOnListCount && (
                      <Text type="danger">
                        近30天上榜
                        {goodsOnListCount}次
                      </Text>
                    )
                  }
                </span>
              </>
            }
          />
        );
      },
    },
    {
      title: (
        <Space>
          商品热度
          <Tooltip
            title={
              <>
                商品热度是基于销量、浏览点赞量、新鲜度等维度加权计算的综合指标，值越大代表商品热门程度越高
              </>
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </Space>
      ),
      showSorterTooltip: false,
      dataIndex: 'goodsHeat',
      key: 'goodsHeat',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '行业分类',
      dataIndex: 'goodsFirstIndustry',
      key: 'goodsFirstIndustry',
    },
    {
      title: '新品',
      dataIndex: 'isNew',
      key: 'isNew',
      sorter: true,
      render: (text, record) => {
        return <>{text ? '是' : '否'}</>;
      },
    },
    {
      title: '关联视频数',
      dataIndex: 'goodsVideoCount',
      key: 'goodsVideoCount',
      sorter: true,
      format: 'shortNumber(0)',
    },
    {
      title: '商品曝光量增量',
      sorter: true,
      key: 'goodsVideoVisitorCountIncrement',
      dataIndex: 'goodsVideoVisitorCountIncrement',
      format: 'shortNumber',
      defaultSortOrder: 'descend',
      render(value, record) {
        const { goodsVideoVisitorCountAmplitude: amplitude } = record;
        return (
          <Space>
            <span>{value}</span>
            {amplitude !== undefined && Math.round(amplitude) > 0 && (
              <Text type="danger">
                ↑{amplitude >= 10000 && <>10000+</>}
                {amplitude < 10000 && <>{amplitude.toFixed(0)}</>}%
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: (
        <Space>
          全网销售增量
          <Tooltip
            title={
              <>
                <div>全网销量增量按照日期的环比来计算</div>
                <div>淘宝商品销量为该商品近30天的淘宝总销量</div>
                <div>好货商品销量为该商品当日累积总销量</div>
              </>
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </Space>
      ),
      showSorterTooltip: false,
      key: 'goodsSalesIncrement',
      dataIndex: 'goodsSalesIncrement',
      sorter: true,
      format: 'shortNumber',
      render(value, record) {
        const { cumulativeSales } = record;

        return (
          <Space>
            <span>{value}</span>
            {cumulativeSales && (
              <Typography.Link>
                <Popover
                  title="累积销量趋势"
                  content={<LineChart data={cumulativeSales} height={150} />}
                >
                  <LineChartOutlined />
                </Popover>
              </Typography.Link>
            )}
          </Space>
        );
      },
    },
    {
      title: '原价（元）',
      key: 'goodsMarketPrice',
      dataIndex: 'goodsMarketPrice',
      sorter: true,
      format: 'rmb',
    },
    {
      title: '折扣价（元）',
      key: 'goodsPrice',
      dataIndex: 'goodsPrice',
      sorter: true,
      format: 'rmb',
    },
    {
      title: '用券价（元）',
      key: 'goodsDiscountPrice',
      dataIndex: 'goodsDiscountPrice',
      sorter: true,
      format: 'rmb',
    },
    {
      title: '佣金（元）',
      key: 'goodsCosFee',
      dataIndex: 'goodsCosFee',
      sorter: true,
      format: 'rmb',
    },
    {
      title: '佣金比例',
      key: 'cosFeeRatio',
      dataIndex: 'cosFeeRatio',
      sorter: true,
      formatter: value => {
        return `${Number(value).toFixed(2)}%`;
      },
    },
    {
      title: '商品曝光量',
      key: 'goodsVideoVisitorCount',
      dataIndex: 'goodsVideoVisitorCount',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '全网销售量',
      key: 'goodsSalesCount',
      dataIndex: 'goodsSalesCount',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '商家信息',
      key: 'shopInfo',
      dataIndex: 'shopInfo',
      render(shopInfo) {
        if (!shopInfo) {
          return;
        }

        return (
          <Tooltip placement="left" title={<ShopInfo {...shopInfo} />}>
            <Typography.Link>{shopInfo.shopName}</Typography.Link>
          </Tooltip>
        );
      },
    },
  ];
  return columns;
}
