import React from 'react';
import { Space, Tooltip, Typography } from 'antd';
import { Link } from 'react-router-dom';

import LogoTitle from '$components/LogoTitle';
import getChannelUrl from '$utils/getChannelUrl';

import styles from './App.module.less';

const Text = Typography.Text;

/**
 * isWebAdvertiser 是否是 Web 广告主
 */
export default function getColumns({ queryParams, isWebAdvertiser }) {
  function getQueryUrlStr(record) {
    const { daterange, serviceChannel } = queryParams;
    const urlSearchParamsObj = new URLSearchParams({
      daterange,
    });
    if (serviceChannel) {
      urlSearchParamsObj.append('serviceChannel', serviceChannel);
    }
    if (record.appId && !urlSearchParamsObj.get('appId')) {
      urlSearchParamsObj.append('appId', record.appId);
    }
    return decodeURIComponent(urlSearchParamsObj.toString());
  }

  const columns = [
    {
      title: 'APP名称',
      fixed: 'left',
      dataIndex: 'advertiserName',
      key: 'advertiserName',
      render: (text, record) => {
        const href = `/adver/analysis/${isWebAdvertiser ? 'web' : 'app'}/${
          record.advertiserId
        }?${getQueryUrlStr(record)}`;
        return (
          <LogoTitle src={record.advertiserIcon} href={href} title={text} />
        );
      },
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      formatter(values) {
        return values.join(',');
      },
    },
    {
      title: isWebAdvertiser ? '行业分类' : 'APP分类',
      key: 'advertiserCat',
      dataIndex: 'advertiserCat',
    },
    {
      title: '在投广告平台',
      key: 'serviceChannel',
      dataIndex: 'serviceChannel',
      render(serviceChannel, record) {
        if (!Array.isArray(serviceChannel)) {
          return false;
        }

        return (
          <Space size="small">
            {serviceChannel.map(t => {
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
      title: '广告素材数',
      key: 'count',
      dataIndex: 'count',
      sorter: true,
      format: 'shortNumber',
      render: (text, record) => {
        const href = `/adver/analysis/app/${
          record.advertiserId
        }?${getQueryUrlStr(record)}`;
        return <Link to={href}>{Number(text).toLocaleString()}</Link>;
      },
    },
    {
      title: '是否在AMS库',
      key: 'ams',
      dataIndex: 'ams',
      render: text => {
        return text ? '是' : <Text type="danger">否</Text>;
      },
    },
    {
      title: 'AMS曝光',
      key: 'amsExposure',
      dataIndex: 'amsExposure',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '曝光指数',
      key: 'exposureNum',
      dataIndex: 'exposureNum',
      sorter: true,
      format: 'shortNumber',
    },
    {
      title: '预估曝光',
      key: 'estimateExposure',
      dataIndex: 'estimateExposure',
      sorter: true,
      defaultSortOrder: 'descend',
      format: 'shortNumber',
    },
    {
      title: '公司主体',
      key: 'companyInfo',
      dataIndex: 'companyInfo',
      render: companyInfo => {
        const { companyName, legalPerson, address, phone, creditCode } =
          companyInfo[0] || {};

        if (!companyName) {
          return '-';
        }

        return (
          <Tooltip
            title={
              <div>
                <div>
                  <span className={styles.label}>公司名称：</span>
                  <span>{companyName}</span>
                </div>
                <div>
                  <span className={styles.label}>法人：</span>
                  <span>{legalPerson}</span>
                </div>
                <div>
                  <span className={styles.label}>地址：</span>
                  <span>{address}</span>
                </div>
                <div>
                  <span className={styles.label}>电话：</span>
                  <span>{phone}</span>
                </div>
                <div>
                  <span className={styles.label}>统一社会信用码：</span>
                  <span>{creditCode}</span>
                </div>
              </div>
            }
            placement="left"
          >
            <Typography.Link className={styles.companyName}>
              {companyName}
            </Typography.Link>
          </Tooltip>
        );
      },
    },
  ];
  return columns;
}
