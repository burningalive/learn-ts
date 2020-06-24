import React, { useEffect, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rate, Card, Space, Spin, Avatar } from 'antd';
import { useMutationReset, LOADINGNAMESPACE } from '@tencent/rsf';
import { useLocation, useRouteMatch } from 'react-router-dom';
import getQueryParams from '@tencent/shared-utils/lib/url/getQueryParams';
import { RechartTool, CardTab } from '@tencent/shared-components';

import Product from '$view/tiktokEcommerceAnalysis/Product';
import Video from '$view/tiktokEcommerceAnalysis/Video';
import ShopInfo from '$components/ShopInfo';
import getDateRangeByDateType from '$utils/getDateRangeByDateType';
import getChannelUrl from '$utils/getChannelUrl';
import { namespace as getTiktokShopDetailsNamespace } from '$mutations/api/getTiktokShopDetails';

import noImage from '$assets/img/no-image.svg';
import styles from './Details.module.less';

function Details(props) {
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    params: { shopId },
  } = useRouteMatch();
  const queryParams = getQueryParams(location.search);
  const { date, dateType } = queryParams;
  const { startDate, endDate } = useMemo(() => {
    const daterange = getDateRangeByDateType(date, dateType);
    return {
      startDate: daterange[0],
      endDate: daterange[1],
    };
  }, [date, dateType]);
  const shopInfo = useSelector(state => state[getTiktokShopDetailsNamespace]);
  const { shopName, shopPhoto, goodsSource } = shopInfo;
  const detailsLoading = useSelector(
    state => state[LOADINGNAMESPACE][getTiktokShopDetailsNamespace]
  );

  useMutationReset([getTiktokShopDetailsNamespace]);

  useEffect(() => {
    dispatch({
      type: `${getTiktokShopDetailsNamespace}/request`,
      payload: {
        dateType,
        searchContent: {
          startDate,
          endDate,
          shopId,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Spin className={styles.details} spinning={detailsLoading}>
      <div className={styles.detailsTop}>
        <Card bordered={false}>
          <Space size="middle">
            <Avatar shape="square" size={120} src={shopPhoto || noImage} />
            <Space size="small">
              <div>{shopName}</div>
              <Avatar
                size="small"
                shape="square"
                src={getChannelUrl(goodsSource)}
              />
            </Space>
          </Space>
        </Card>
      </div>
      <Content shopInfo={shopInfo} shopId={shopId} />
    </Spin>
  );
}
Details.displayName = 'Details';

const Content = memo(props => {
  const { shopInfo, shopId } = props;
  const tabList = [
    {
      key: 'detail',
      tab: '店铺详情',
      content: <ShopDetails shopInfo={shopInfo} />,
    },
    {
      key: 'product',
      tab: '商品分析',
      content: <Product shopId={shopId} />,
    },
    {
      key: 'video',
      tab: '视频分析',
      content: <Video shopId={shopId} />,
    },
  ];
  return (
    <CardTab className={styles.content} tabList={tabList} bordered={false} />
  );
});

function ShopDetails(props) {
  const { shopInfo } = props;
  const {
    charts = [],
    praiseScore,
    praiseDescription,
    serviceScore,
    serviceDescription,
    speedScore,
    speedDescription,
  } = shopInfo;

  return (
    <Card bordered={false}>
      <Space
        direction="vertical"
        size="middle"
        className={styles.detailsTabContent}
      >
        <Card title="平台评分" type="inner">
          <Space direction="vertical" size="middle" align="baseline">
            <Space>
              <Rate value={praiseScore} disabled />
              <span>
                {/* 用户口碑  */}
                描述相符 <b>{Number(praiseScore || 0).toFixed(1)}</b>
              </span>
              {praiseDescription && <span>{praiseDescription}</span>}
            </Space>
            <Space>
              <Rate value={serviceScore} disabled />
              <span>
                服务态度 <b>{Number(serviceScore || 0).toFixed(1)}</b>
              </span>
              <span>{serviceDescription || '-'}</span>
            </Space>
            <Space>
              <Rate value={speedScore} disabled />
              <span>
                {/* 发货速度 */}
                物流服务 <b>{Number(speedScore || 0).toFixed(1)}</b>
              </span>
              <span>{speedDescription || '-'}</span>
            </Space>
          </Space>
        </Card>
        <Card title="商家信息" type="inner">
          <ShopInfo {...shopInfo} />
        </Card>
        {charts.map(d => {
          return (
            <RechartTool
              key={d.title}
              title={d.title}
              type="line"
              data={d}
              yAxisFormat={d.format}
            />
          );
        })}
      </Space>
    </Card>
  );
}

export default Details;
