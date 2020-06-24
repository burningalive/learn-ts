import React, { useCallback, memo } from 'react';
import moment from 'moment';
import { Card, Select, Button, BackTop } from 'antd';
import {
  QueryContainer,
  FormItem,
  RangePicker,
  TagSelect,
} from '@tencent/shared-components';

import useAdertiser from '$src/hooks/useAdertiser';
import { tagGroupValueToRequestArg } from '$utils/valueToRequestArg';
import axios from '$utils/axios';

import styles from './index.module.less';
import { useTabOptions } from './useTabOptions';
import ImgCard from './ImgCard';

const sortData = [
  { value: 'exposure_num', label: '按曝光指数升序' },
  { value: '-exposure_num', label: '按曝光指数降序' },
  { value: 'estimate_exposure', label: '按预估曝光升序' },
  { value: '-estimate_exposure', label: '按预估曝光降序' },
  { value: 'first_fetch_time', label: '按首次采集时间升序' },
  { value: '-first_fetch_time', label: '按首次采集时间降序' },
  { value: '-delivery_fetch_duration', label: '按有效投放时长升序' },
  { value: 'delivery_fetch_duration', label: '按有效投放时长降序' },
];

export default function LandingPageAnalysis() {
  const {
    form,
    mapObj,
    expand,
    refContainer,
    disabledDate,
    onSubmit,
    onMount,
    onDownload,
    daterangeInitailValue,
  } = useAdertiser({ dateCheckType: 'advertiser' });

  const { industryOptions, platformOptions, osOptions } = useTabOptions(mapObj);

  const outerRequest = useCallback(
    (
      formValues,
      pagination,
      sorter = {
        field: 'estimateExposure',
        order: 'descend',
      }
    ) => {
      const {
        advertiserType = [2], // 后台就这么定的
        advertiserCat = [],
        serviceChannel = {},
        os = [],
      } = formValues;
      const _serviceChannel = [];
      let _serviceMedia = [];

      Object.keys(serviceChannel).forEach(s => {
        // 其中归类于 serviceChannel，为了兼容之前的 api，先把新的serviceChannel拆分为旧的serviceChannel和serviceMedia
        _serviceChannel.push(s);
        _serviceMedia = _serviceMedia.concat(serviceChannel[s]);
      });
      const params = {
        searchContent: {
          advertiserCat: tagGroupValueToRequestArg(advertiserCat),
          advertiserType,
          os,
          serviceChannel: _serviceChannel,
          serviceMedia: _serviceMedia,
          startDate: formValues.daterange[0],
          endDate: formValues.daterange[1],
        },
        pagination: {
          pageSize: pagination.pageSize,
          current: pagination.current,
        },
        sort: {
          // 后端的接口统一为下划线，前端转换为了驼峰式，需要转换。
          field: sorter.field,
          desc: sorter.order === 'descend',
        },
      };

      refContainer.current.submitValues = params;

      return axios
        .post('testLandpage/testList', params)
        .then(({ data: { data, pagination } }) => {
          return { dataSource: data, pagination: { total: pagination.total } };
        });
    },
    [refContainer]
  );

  const contentRenderer = useCallback(({ result: { dataSource } }) => {
    return <Content data={dataSource} />;
  }, []);

  return (
    <>
      <QueryContainer
        onMount={onMount}
        request={outerRequest}
        onSubmit={onSubmit}
      >
        <Card bordered={false}>
          <QueryContainer.QueryForm
            form={form}
            expand={expand}
            expandLayout="horizontal"
            splitCount={1}
          >
            <FormItem
              name="daterange"
              label="日期"
              required
              submitFormatter={values => {
                return [
                  moment(values[0]).format('YYYY-MM-DD'),
                  moment(values[1]).format('YYYY-MM-DD'),
                ];
              }}
              initialValue={daterangeInitailValue}
            >
              <RangePicker disabledDate={disabledDate} />
            </FormItem>
            <FormItem name="advertiserCat" label="行业">
              <TagSelect
                expand={false}
                multiple
                showMoreOption
                options={industryOptions}
              />
            </FormItem>
            <FormItem name="serviceChannel" label="投放平台">
              <TagSelect isOptGroup multiple options={platformOptions} />
            </FormItem>
            <FormItem name="os" label="操作系统">
              <TagSelect multiple options={osOptions} />
            </FormItem>
          </QueryContainer.QueryForm>
        </Card>
        <QueryContainer.Content
          title="查询结果"
          extra={
            <div>
              <Button onClick={onDownload.bind(this, 'landpage')}>导出</Button>
              <QueryContainer.SorterSelect
                className={styles.sortSelect}
                defaultValue="-exposure_num"
              >
                {sortData.map(({ value, label }) => (
                  <Select.Option value={value} key={value}>
                    {label}
                  </Select.Option>
                ))}
              </QueryContainer.SorterSelect>
            </div>
          }
        >
          {contentRenderer}
          <QueryContainer.Pagination />
        </QueryContainer.Content>
      </QueryContainer>
    </>
  );
}

const Content = memo(props => {
  const { data = [] } = props;
  return (
    <>
      <div className={styles.contentBox}>
        {data.map((item, index) => (
          <ImgCard key={index.toString()} data={item} />
        ))}
      </div>
      <BackTop />
    </>
  );
});
