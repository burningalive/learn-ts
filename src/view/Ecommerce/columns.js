import React from 'react';
import { Space, Typography, Tooltip, Popover, Button } from 'antd';
import { LineChart } from '@tencent/shared-components';
import { Link } from 'react-router-dom';
import { QuestionCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import getChannelUrl from '$utils/getChannelUrl';

import LogoTitle from '$components/LogoTitle';
import ShopInfo from '$components/ShopInfo';

import ProductCard from './ProductCard';
import styles from './index.module.less';

const Text = Typography.Text;

function toYesOrNot(data) {
  return data ? '是' : '否';
}

export function getCategoryColumns({ queryParams }) {
  function getQueryUrlStr(record) {
    const { daterange } = queryParams;
    const urlSearchParamsObj = new URLSearchParams({
      daterange,
    });

    if (record.goodsType) {
      // 需要加 `,`，在URL上才会识别为数组类型
      urlSearchParamsObj.append('goodsType', `${record.goodsType},`);
    }
    return decodeURIComponent(urlSearchParamsObj.toString());
  }
  const categoryColumns = [
    {
      title: '品类名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      render: (text, record) => {
        const href = `/direct/ec/ad/analysis/product?${getQueryUrlStr(record)}`;
        return <LogoTitle src={record.goodsIcon} href={href} title={text} />;
      },
    },
    {
      title: '行业分类',
      key: 'cate2',
      dataIndex: 'cate2',
      render: (text, record) => {
        const { cate } = record;
        return <span>{cate + ' | ' + text}</span>;
      },
    },
    {
      title: '投放平台',
      key: 'serviceChannel',
      dataIndex: 'serviceChannel',
      render(serviceChannel, record) {
        if (!Array.isArray(serviceChannel)) {
          return false;
        }
        return (
          <Space size="small">
            {serviceChannel.map(t => {
              if (t === '') {
                // 过滤空值
                return null;
              }

              const channelUrl = getChannelUrl(t);

              return (
                <img
                  className={styles.platformLogo}
                  src={channelUrl}
                  alt=""
                  key={t}
                />
              );
            })}
          </Space>
        );
      },
    },
    {
      title: '单价',
      key: 'currentPrice',
      dataIndex: 'currentPrice',
    },
    {
      title: '销量',
      key: 'saleVolume',
      dataIndex: 'saleVolume',
      format: 'shortNumber',
      sorter: true,
    },
    {
      title: '素材数',
      key: 'advCount',
      dataIndex: 'advCount',
      format: 'shortNumber(0)',
      sorter: true,
    },
    {
      title: '预估曝光',
      key: 'materialEstimateExposure',
      dataIndex: 'materialEstimateExposure',
      sorter: true,
      defaultSortOrder: 'descend',
      format: 'shortNumber',
    },
  ];
  return categoryColumns;
}

export function getProductColumns({ salesIncVisible, queryParams }) {
  function getDetailQueryUrlStr(record) {
    const { daterange, serviceChannel } = queryParams;
    const urlSearchParamsObj = new URLSearchParams({
      daterange,
    });

    if (serviceChannel) {
      urlSearchParamsObj.append('serviceChannel', serviceChannel);
    }

    return decodeURIComponent(urlSearchParamsObj.toString());
  }

  function getCategoryQueryUrlStr(record) {
    const { daterange } = queryParams;
    const urlSearchParamsObj = new URLSearchParams({ daterange });

    if (record.goodsType) {
      // 需要加 `,`，在URL上才会识别为数组类型
      urlSearchParamsObj.append('goodsType', `${record.goodsType},`);
    }
    return decodeURIComponent(urlSearchParamsObj.toString());
  }
  const productColumns = [
    {
      title: '商品名称',
      className: styles.goodsTitle,
      wrap: true,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      render: (text, record) => {
        const href = `/direct/ec/ad/analysis/product/${record.advertiserId}/${
          record.id
        }?${getDetailQueryUrlStr(record)}`;

        return <LogoTitle src={record.icon} href={href} title={text} />;
      },
    },
    {
      title: '新品',
      fixed: 'center',
      dataIndex: 'isNew',
      render: text => <Text>{toYesOrNot(text)}</Text>,
    },
    {
      title: (
        <>
          <span>全网销量 </span>
          <Tooltip title="区间最大销量">
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      showSorterTooltip: false,
      dataIndex: 'saleVolume',
      sorter: true,
      format: 'shortNumber',
      render: (text, record) => {
        const {
          lineData: { data = [], date = [] },
        } = record;
        const isDisplaylineChart = !!(
          data &&
          data.length &&
          date &&
          date.length &&
          data.length === date.length
        );
        const chartData = {
          dataKeys: [{ dataKey: 'value' }],
          chartData: [],
        };
        if (isDisplaylineChart) {
          data.forEach((val, idx) => {
            chartData.chartData.push({
              name: date[idx],
              value: data[idx],
            });
          });
        }
        const content = (
          <div className={styles.lineChartBox}>
            <LineChart data={chartData} height={200} />
          </div>
        );

        return (
          <div className={styles.saleVolumeBox} title={text}>
            <Typography.Text ellipsis className={styles.saleVolumeBoxTitle}>
              {text}
            </Typography.Text>
            {isDisplaylineChart && (
              <Popover
                title={<div className={styles.popoverTitle}>累计销量趋势</div>}
                placement="top"
                content={content}
              >
                <LineChartOutlined className={styles.chartIcon} />
              </Popover>
            )}
          </div>
        );
      },
    },
    {
      title: '商品在库',
      sorter: false,
      dataIndex: 'isAms',
      render: text => <Text>{toYesOrNot(text)}</Text>,
    },
    {
      title: '内部商品数',
      dataIndex: 'internelGoodsNum',
      render: (text, record) => {
        const { dpaShopInfo } = record;
        const content = <ProductCard data={record} />;
        if (dpaShopInfo && typeof dpaShopInfo === 'object') {
          return (
            <Popover placement="top" content={content}>
              <span>{text}</span>
            </Popover>
          );
        }
        return <span>{text}</span>;
      },
    },
    {
      title: '内部销量',
      dataIndex: 'internelSaleVolume',
      render: text => {
        return <Text>{text}</Text>;
      },
    },
    {
      title: '品类名称',
      dataIndex: 'goodsType',
      render: (text, record) => {
        const href = `/direct/ec/ad/analysis/category?${getCategoryQueryUrlStr(
          record
        )}`;
        return <Link to={href}>{record.goodsType}</Link>;
      },
    },
    {
      title: '行业分类',
      key: 'cate2',
      dataIndex: 'cate2',
      render: (text, record) => {
        const { cate } = record;
        return <Text>{cate + ' | ' + text}</Text>;
      },
    },
    {
      title: '单价',
      dataIndex: 'currentPrice',
      sorter: true,
      format: 'rmb',
    },
    {
      title: '素材数',
      dataIndex: 'advCount',
      sorter: true,
    },
    {
      title: '预估曝光',
      dataIndex: 'materialEstimateExposure',
      sorter: true,
      format: 'shortNumber',
      defaultSortOrder: 'descend',
    },
    {
      title: '商家信息',
      dataIndex: 'shopInfo',
      render: text => {
        let shopInfo = text;
        if (typeof shopInfo === 'string') {
          shopInfo = JSON.parse(shopInfo);
        }

        return (
          <Tooltip title={<ShopInfo {...shopInfo} />} placement="left">
            <Button type="link" className={styles.shopInfoLink}>
              {shopInfo.shopName}
            </Button>
          </Tooltip>
        );
      },
    },
  ];
  const productSalesColumns = [
    {
      title: '昨日新增销量',
      fixed: 'center',
      dataIndex: 'saleVolumeIncOne',
      sorter: true,
    },
    {
      title: '3日新增销量',
      fixed: 'center',
      dataIndex: 'saleVolumeIncThree',
      key: 'saleVolumeIncThree',
      sorter: true,
    },
    {
      title: '7日新增销量',
      fixed: 'center',
      dataIndex: 'saleVolumeIncSeven',
      key: 'saleVolumeIncSeven',
      sorter: true,
    },
    {
      title: '15日新增销量',
      fixed: 'center',
      dataIndex: 'saleVolumeIncFifteen',
      sorter: true,
    },
  ];
  if (salesIncVisible) {
    productColumns.splice(3, 0, ...productSalesColumns);
  }
  return productColumns;
}
