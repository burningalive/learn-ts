import React, { useEffect } from 'react';
import { Card, Space, Spin, Typography } from 'antd';
import { useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMutationReset, LOADINGNAMESPACE } from '@tencent/rsf';
import { CardTab } from '@tencent/shared-components';
import TrendDetails from './Trend';
import MaterialDetails from './MaterialDetails';
import ExposureDistribution from './ExposureDistribution';
import SaleTrend from './SaleTrend';

import { namespace as getMerchantDetailsNamespace } from '$mutations/api/getMerchantDetails';
import noImage from '$assets/img/no-image.svg';
import styles from './Details.module.less';

const { Text } = Typography;

function Details(props) {
  const dispatch = useDispatch();
  const { advertiserIcon, advertiserName, cate, cate2 } = useSelector(
    state => state[getMerchantDetailsNamespace]
  );
  const detailsLoading = useSelector(
    state => state[LOADINGNAMESPACE][getMerchantDetailsNamespace]
  );
  useMutationReset([getMerchantDetailsNamespace]);
  useEffect(() => {
    dispatch({
      type: `${getMerchantDetailsNamespace}/request`,
    });
  }, [dispatch]);

  const {
    params: { advertiserId, productId },
  } = useRouteMatch();

  const tabList = [
    {
      key: '1',
      tab: '广告素材',
      content: (
        <MaterialDetails
          goodsAdvertiserId={advertiserId}
          productId={productId}
        />
      ),
    },
    {
      key: '2',
      tab: '投放趋势',
      content: (
        <TrendDetails goodsAdvertiserId={advertiserId} productId={productId} />
      ),
    },
    {
      key: '3',
      tab: '曝光地域分布',
      content: (
        <ExposureDistribution
          goodsAdvertiserId={advertiserId}
          productId={productId}
        />
      ),
    },
    {
      key: '4',
      tab: '销量趋势',
      content: (
        <SaleTrend goodsAdvertiserId={advertiserId} productId={productId} />
      ),
    },
  ];
  // 没有图片
  return (
    <div className={styles.details}>
      <Spin className={styles.detailsTop} spinning={detailsLoading}>
        <Card bordered={false}>
          <Space size="large">
            <Space size="middle">
              <img
                alt=""
                className={styles.headerLogo}
                src={advertiserIcon || noImage}
              />
              <h3 className={styles.headerName}>{advertiserName}</h3>
            </Space>
            <Space size="small" direction="vertical">
              <div>
                行业：
                <Text type="secondary">
                  {cate} | {cate2}
                </Text>
              </div>
            </Space>
          </Space>
        </Card>
      </Spin>
      <CardTab className={styles.content} tabList={tabList} bordered />
    </div>
  );
}
Details.displayName = 'Details';

export default Details;
