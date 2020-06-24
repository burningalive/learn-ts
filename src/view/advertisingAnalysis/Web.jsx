import React from 'react';
import { Card, Select, Button } from 'antd';
import {
  QueryContainer,
  FormItem,
  RangePicker,
  TagSelect,
} from '@tencent/shared-components';
import moment from 'moment';

import SelectionSelect from '$components/SelectionSelect';
import useAdertiser from '$src/hooks/useAdertiser';
import axios from '$utils/axios';
import {
  transformFromOneLevel,
  transformFromTwoLevel,
} from '$utils/mapObjTranform';

// Content 组件和 sortData 和 App  的一样
import { Content, sortData } from './App';

import styles from './App.module.less';

function Web() {
  const {
    form,
    mapObj,
    expand,
    refContainer,
    advertiserCatValues,
    disabledDate,
    onSubmit,
    onMount,
    onDownload,
    onValuesChange,
    daterangeInitailValue,
  } = useAdertiser({ dateCheckType: 'material' });

  function outerRequest(
    formValues,
    pagination = { pageSize: 10, current: 1 },
    sort = {
      field: 'estimate_exposure',
      order: 'descend',
    }
  ) {
    const {
      advertiserCat = [],
      advertiserName = [],
      advFormat = [],
      serviceChannel = {},
      os = [],
    } = formValues;
    const _serviceChannel = [];
    let _serviceMedia = [];
    Object.keys(serviceChannel).forEach(s => {
      // 其中归类于 serviceChannel，为了兼容之前的 api，先把新的serviceChannel拆分为旧的serviceChannel和serviceMedia
      _serviceChannel.push(Number(s));
      _serviceMedia = _serviceMedia.concat(serviceChannel[s]);
    });

    const params = {
      searchContent: {
        // title: 2 是固定的
        advertiserCat: [{ title: 2, array: advertiserCat }],
        advertiserName,
        advertiserType: [2], // 相当于网页广告主
        advFormat,
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
        field: sort.field,
        desc: sort.order === 'descend',
      },
    };

    refContainer.current.submitValues = params;

    return axios.post('testMaterial/testList2', params).then(response => {
      const {
        data: { data, pagination },
      } = response;
      return {
        dataSource: data,
        pagination: {
          total: pagination.total,
        },
      };
    });
  }

  return (
    <QueryContainer
      request={outerRequest}
      onMount={onMount}
      onSubmit={onSubmit}
    >
      <Card bordered={false}>
        <QueryContainer.QueryForm
          // onValuesChange={onValuesChange}
          form={form}
          expand={expand}
          expandLayout="horizontal"
          splitCount={2}
          onValuesChange={onValuesChange}
        >
          <FormItem
            name="daterange"
            label="日期"
            required
            initialValue={daterangeInitailValue}
            submitFormatter={values => {
              return [
                moment(values[0]).format('YYYY-MM-DD'),
                moment(values[1]).format('YYYY-MM-DD'),
              ];
            }}
          >
            <RangePicker disabledDate={disabledDate} />
          </FormItem>
          <SelectionSelect
            name="advertiserName"
            label="广告主名称"
            params={{
              type: 'material',
              advertiserCat: advertiserCatValues,
              advertiserType: [2],
            }}
          />
          <FormItem name="advertiserCat" label="广告分类">
            <TagSelect
              options={transformFromOneLevel(mapObj.noAppCat)}
              multiple
            />
          </FormItem>
          <FormItem name="serviceChannel" label="投放平台">
            <TagSelect
              options={transformFromTwoLevel(mapObj.serviceChannel)}
              isOptGroup
            />
          </FormItem>
          <FormItem name="advFormat" label="素材类型">
            <TagSelect
              multiple
              options={transformFromOneLevel(mapObj.advFormat)}
            />
          </FormItem>
          <FormItem name="os" label="操作系统">
            <TagSelect multiple options={transformFromOneLevel(mapObj.os)} />
          </FormItem>
        </QueryContainer.QueryForm>
      </Card>
      <QueryContainer.Content
        title="分析结果"
        extra={
          <div>
            <Button onClick={onDownload.bind(this, 'material')}>导出</Button>
            <QueryContainer.SorterSelect
              className={styles.sortSelect}
              defaultValue="-estimate_exposure"
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
        {({ result: { dataSource } }) => {
          return <Content data={dataSource} />;
        }}
        <QueryContainer.Pagination />
      </QueryContainer.Content>
    </QueryContainer>
  );
}
Web.displayName = 'Web';

export default Web;
