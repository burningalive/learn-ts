import React, { memo } from 'react';
import {
  QueryContainer,
  FormItem,
  DatePicker,
  CardTab,
} from '@tencent/shared-components';
import { Card } from 'antd';
import moment from 'moment';

import useQueryContainer from '$src/hooks/useQueryContainer';
import axios from '$utils/axios';
import TopStatistic from './TopStatistic';
import MediaDrop from './MediaDrop';
import MediaProduct from './MediaProduct';
import MediaIndustry from './MediaIndustry';

import styles from './index.module.less';

export default function MarketOverview() {
  const { form, onMount, onSubmit } = useQueryContainer({
    requiredFields: ['date'],
  });

  function outerRequest(formValues) {
    return axios.post('statistic/testList', formValues).then(response => {
      return { dataSource: response.data.data };
    });
  }

  return (
    <QueryContainer
      request={outerRequest}
      onMount={onMount}
      className={styles.marketOverview}
      useContentCard={false}
      onSubmit={onSubmit}
    >
      <Card bordered={false}>
        <QueryContainer.QueryForm form={form}>
          <FormItem
            name="date"
            label="日期"
            submitFormatter={value => {
              return moment(value).format('YYYY-MM-DD');
            }}
            initialValue={moment()}
          >
            <DatePicker />
          </FormItem>
        </QueryContainer.QueryForm>
      </Card>
      <QueryContainer.Content>
        {({ result: { dataSource } }) => {
          return <Content data={dataSource} />;
        }}
      </QueryContainer.Content>
    </QueryContainer>
  );
}

// TODO useContentCard=false ，每次渲染都会造成重新渲染，QueryContianer 组件需要优化。
/**
 * 这里使用 memo 做了浅层 props 对比，每次查询，这里只会渲染一次，深层的对比目前不是很必要。
 * 比较 dataSource 的数据是后端返回的，有时候渲染一次的速度并不会比对比慢多少，而且后端的数据还可能变化。
 */
const Content = memo(props => {
  const {
    data: { mediaData, adData, dataFlow, adloadFlow },
  } = props;
  const tabList = [
    {
      key: '1',
      tab: '分媒体广告摘要',
      content: (
        <MediaDrop
          mediaData={mediaData}
          dataFlow={dataFlow}
          adloadFlow={adloadFlow}
        />
      ),
    },
    {
      key: '2',
      tab: '分媒体产品数据',
      content: <MediaProduct mediaData={mediaData} />,
    },
    {
      key: '3',
      tab: '分媒体行业数据情况',
      content: <MediaIndustry mediaData={mediaData} />,
    },
  ];

  return (
    <>
      <TopStatistic {...adData} />
      <CardTab className={styles.dataContent} tabList={tabList} />
    </>
  );
});
