import React, { useEffect, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Space, Spin, Typography, Avatar, Tooltip } from 'antd';
import { useMutationReset, LOADINGNAMESPACE } from '@tencent/rsf';
import { useLocation, useRouteMatch } from 'react-router-dom';
import getQueryParams from '@tencent/shared-utils/lib/url/getQueryParams';
import { CardTab } from '@tencent/shared-components';
import getFomatValue from '@tencent/shared-utils/lib/format/getFomatValue';

import ShopInfo from '$components/ShopInfo';
import getDateRangeByDateType from '$utils/getDateRangeByDateType';
import getChannelUrl from '$utils/getChannelUrl';
import { namespace as getTiktokProductDetailsNamespace } from '$mutations/api/getTiktokProductDetails';

import RelatedVideo from './RelatedVideo';
import ProductHeat from './ProductHeat';

import noImage from '$assets/img/no-image.svg';
import styles from './Details.module.less';

const { Text } = Typography;

function Details(props) {
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    params: { goodsId },
  } = useRouteMatch();
  const queryParams = getQueryParams(location.search);
  const { date, dateType, goodsType } = queryParams;
  const { startDate, endDate } = useMemo(() => {
    const daterange = getDateRangeByDateType(date, dateType);
    return {
      startDate: daterange[0],
      endDate: daterange[1],
    };
  }, [date, dateType]);
  const {
    goodsUrlPicturesPath,
    goodsTitle,
    goodsMarketPrice = 0,
    goodsPrice = 0,
    goodsDiscountPrice = 0,
    goodsSource,
    shopInfo,
    goodsSalesCount,
    goodsVideoVisitorCountIncrement,
    goodsSalesIncrement,
  } = useSelector(state => state[getTiktokProductDetailsNamespace]);
  const detailsLoading = useSelector(
    state => state[LOADINGNAMESPACE][getTiktokProductDetailsNamespace]
  );

  useMutationReset([getTiktokProductDetailsNamespace]);

  useEffect(() => {
    dispatch({
      type: `${getTiktokProductDetailsNamespace}/request`,
      payload: {
        dateType,
        searchContent: {
          startDate,
          endDate,
          goodsId,
          goodsType,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.details}>
      <Spin className={styles.detailsTop} spinning={detailsLoading}>
        <Card bordered={false}>
          <Space size="middle">
            <Avatar
              shape="square"
              size={120}
              src={goodsUrlPicturesPath || noImage}
            />
            <Space size="small" direction="vertical">
              <div>{goodsTitle}</div>
              <Space size="small">
                <Text type="danger" className={styles.price}>
                  {/* 单位为分 */}￥
                  {(
                    Math.min(goodsMarketPrice, goodsPrice, goodsDiscountPrice) /
                    100
                  ).toFixed(2)}
                </Text>
                <Avatar
                  size="small"
                  shape="square"
                  src={getChannelUrl(goodsSource)}
                />
                {shopInfo && (
                  <Tooltip title={<ShopInfo {...shopInfo} />}>
                    <div>{shopInfo.shopName}</div>
                  </Tooltip>
                )}
              </Space>
              <Space>
                <div>
                  全网销量：{getFomatValue(goodsSalesCount, 'shortNumber(0)')}
                </div>
                <div>
                  昨日商品曝光量增量：
                  {getFomatValue(
                    goodsVideoVisitorCountIncrement,
                    'shortNumber'
                  )}
                </div>
                <div>
                  {/* 若是淘宝系商品，不显示昨日销量增量内容 */}
                  {goodsSource !== '淘宝' && goodsSource !== '天猫' && (
                    <>
                      昨日销量增量：
                      {getFomatValue(goodsSalesIncrement, 'shortNumber')}
                    </>
                  )}
                </div>
              </Space>
            </Space>
          </Space>
        </Card>
      </Spin>
      <Content />
    </div>
  );
}
Details.displayName = 'Details';

/**
 * 没有任何 props 和 children memo 是很有效的避免重复渲染的。
 */
const Content = memo(props => {
  const tabList = [
    {
      key: '1',
      tab: '关联视频',
      content: <RelatedVideo />,
    },
    {
      key: '2',
      tab: '商品热度分析',
      content: <ProductHeat />,
    },
  ];
  return <CardTab className={styles.content} tabList={tabList} bordered />;
});

export default Details;
