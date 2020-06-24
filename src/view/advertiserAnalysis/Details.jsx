import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, message, Space, Spin, Typography } from 'antd';
import { useMutationReset, LOADINGNAMESPACE } from '@tencent/rsf';
import { useLocation, useRouteMatch } from 'react-router-dom';
import getQueryParams from '@tencent/shared-utils/lib/url/getQueryParams';
import { CardTab } from '@tencent/shared-components';

import { namespace as getAdvertiserDetailsNamespace } from '$mutations/api/getAdvertiserDetails';

import AdvertisingMaterialDetails from './AdvertisingMaterialDetails';
import AdvertisingTrendDetails from './AdvertisingTrendDetails';

import noImage from '$assets/img/no-image.svg';
import styles from './Details.module.less';

const { Text } = Typography;
const amsUrl = 'http://adlab.oa.com';

function Details() {
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    params: { advertiserId },
  } = useRouteMatch();
  const queryParams = getQueryParams(location.search);
  const {
    advertiserIcon,
    advertiserName,
    companyName,
    advertiserType,
    advertiserCat,
    amsAdverIds,
  } = useSelector(state => state[getAdvertiserDetailsNamespace]);
  const detailsLoading = useSelector(
    state => state[LOADINGNAMESPACE][getAdvertiserDetailsNamespace]
  );

  useMutationReset([getAdvertiserDetailsNamespace]);

  useEffect(() => {
    dispatch({
      type: `${getAdvertiserDetailsNamespace}/request`,
      payload: {
        advertiserId,
      },
    });
  }, [advertiserId, dispatch]);

  return (
    <div className={styles.details}>
      <Spin className={styles.detailsTop} spinning={detailsLoading}>
        <Card bordered={false}>
          <Space size="large">
            <Space size="middle">
              <img
                alt=""
                className={styles.advertiserLogo}
                src={advertiserIcon || noImage}
              />
              <h3 className={styles.advertiserTitle}>{advertiserName}</h3>
            </Space>
            <Space size="small" direction="vertical">
              <div>
                公司主体：
                <Text type="secondary"> {companyName}</Text>
              </div>
              {queryParams.appId && (
                <div>
                  包名：
                  <Text type="secondary">{queryParams.appId}</Text>
                </div>
              )}
              <div>
                操作系统：
                <Text type="secondary">
                  {advertiserType} | {advertiserCat}
                </Text>
              </div>
            </Space>
          </Space>
        </Card>
      </Spin>
      <Content queryParams={queryParams} amsAdverIds={amsAdverIds} />
    </div>
  );
}
Details.displayName = 'Details';

function Content(props) {
  const {
    queryParams: { appId, os, daterange },
    amsAdverIds = [],
  } = props;
  const {
    params: { advertiserId },
  } = useRouteMatch();
  const [startDate, endDate] = useMemo(() => {
    return daterange.split(',');
  }, [daterange]);

  function onAmsView() {
    if (!startDate || !endDate || !amsAdverIds) {
      message.error('缺少参数，无法跳转');
      return;
    }
    const myIframe = document.getElementById('iframe');
    if (myIframe) {
      // eslint-disable-next-line camelcase
      const data = { startDate, endDate, ams_adver_ids: amsAdverIds };
      myIframe.contentWindow.postMessage(JSON.stringify(data), amsUrl);
      window.open(amsUrl, '_blank');
    }
  }

  const tabList = [
    {
      key: '1',
      tab: '广告素材',
      content: (
        <AdvertisingMaterialDetails
          appId={appId}
          advertiserId={advertiserId}
          os={os}
        />
      ),
    },
    {
      key: '2',
      tab: '投放趋势',
      content: (
        <AdvertisingTrendDetails
          appId={appId}
          advertiserId={advertiserId}
          os={os}
        />
      ),
    },
    // 没有 amsAdverIds 不需要线上这个 tab
    amsAdverIds &&
      amsAdverIds.length > 0 && {
        key: '3',
        tab: 'AMS 内部素材',
        content: (
          <Card bordered={false} className={styles.amsTabContent}>
            <iframe
              id="iframe"
              src={amsUrl}
              title="iframe"
              style={{ display: 'none' }}
            />
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={onAmsView} onKeyDown={null}>
              点击查看
            </a>
          </Card>
        ),
      },
  ].filter(Boolean);
  return <CardTab className={styles.content} tabList={tabList} bordered />;
}

export default Details;
