import React from 'react';
import { Typography } from 'antd';
import styles from './ProductCard.module.less';
import { LineChart } from '@tencent/shared-components';

export default function ProductCard(props) {
  const { data } = props;
  const { shopLineData, dpaShopInfo } = data;
  if (shopLineData) {
    shopLineData.xHidden = true;
    shopLineData.yHidden = true;
    // shopLineData.title = '销售趋势';
  }
  const isDisplaylineChart =
    shopLineData.data &&
    shopLineData.data.length &&
    shopLineData.date &&
    shopLineData.date.length &&
    shopLineData.data.length === shopLineData.date.length;
  const chartData = {
    dataKeys: [{ dataKey: 'value' }],
    chartData: [],
  };
  if (isDisplaylineChart) {
    shopLineData.data.forEach((val, idx) => {
      chartData.chartData.push({
        name: shopLineData.date[idx],
        value: shopLineData.data[idx],
      });
    });
  }

  const {
    internelGoodsIcon: icon,
    internelGoodsProposal: proposal,
    internelGoodsIds: ids,
    internelGoodsPriceMax: maxPrice,
    internelGoodsPriceMin: minPrice,
  } = dpaShopInfo;
  let displayIds = [];
  if (ids && ids.length) {
    displayIds = ids.slice(0, 3);
  }
  return (
    <div className={styles.cardBox}>
      <div className={styles.info}>
        <img className={styles.imgBox} src={icon} alt="" />
        <div className={styles.detail}>
          <Typography.Paragraph ellipsis={{ rows: 2 }}>
            {proposal}
          </Typography.Paragraph>

          {!!ids.length && (
            <div className={styles.ids} title={ids}>
              <span className={styles.idsTitle}>商品ID:</span>
              <span>{displayIds.join(', ')}</span>
            </div>
          )}
          <div className={styles.price} title={ids}>
            <span className={styles.priceTitle}>价格:</span>
            <span>{`${minPrice} ~ ${maxPrice}`}</span>
          </div>
        </div>
      </div>
      <div className={styles.lineBox}>
        <Typography.Text strong>日销售趋势</Typography.Text>
        <LineChart data={chartData} height={190} />
      </div>
    </div>
  );
}
