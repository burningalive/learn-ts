import React, { useMemo } from 'react';
import { Card, Space, Button, Popover } from 'antd';
import {
  QueryTable,
  QueryContainer,
  FormItem,
  RangePicker,
  TagSelect,
} from '@tencent/shared-components';
import moment from 'moment';
import decamelize from 'decamelize';

import SelectionSelect from '$components/SelectionSelect';
import useAdertiser from '$src/hooks/useAdertiser';
import axios from '$utils/axios';
import {
  transformFromGroup,
  transformFromOneLevel,
  transformFromTwoLevel,
} from '$utils/mapObjTranform';
import { tagGroupValueToRequestArg } from '$utils/valueToRequestArg';

import getColumns from './getColumns';

function App(props) {
  const { advertiserType, selectionSelectLabel } = props;
  const {
    form,
    mapObj,
    expand,
    refContainer,
    queryParams,
    advertiserCatValues,
    disabledDate,
    onSubmit,
    onMount,
    onDownload,
    onValuesChange,
    daterangeInitailValue,
  } = useAdertiser({ dateCheckType: 'advertiser' });
  const columns = useMemo(() => {
    return getColumns({ queryParams });
  }, [queryParams]);

  function outerRequest(
    formValues,
    pagination = { pageSize: 10, current: 1 },
    sort = {
      field: 'estimateExposure',
      order: 'descend',
    }
  ) {
    const {
      advertiserCat = [],
      advertiserName = [],
      ams = [],
      amsExposure = [],
      os = [],
      serviceChannel = {},
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
        advertiserName,
        advertiserType,
        ams,
        amsExposure,
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
      // sort.order 没定义相当于取消排序，按照默认的来处理。
      sort: sort.order && {
        // 后端的接口统一为下划线，前端转换为了驼峰式，需要转换。
        field: decamelize(sort.field),
        desc: sort.order === 'descend',
      },
    };

    refContainer.current.submitValues = params;

    return axios.post('testAdvertiser/testList2', params).then(response => {
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

  function onDownloadCallback(type) {
    onDownload(type === 'result' ? 'advertiser' : 'advertiser_medias');
  }

  return (
    <QueryTable request={outerRequest} onMount={onMount} onSubmit={onSubmit}>
      <Card bordered={false}>
        <QueryContainer.QueryForm
          onValuesChange={onValuesChange}
          form={form}
          expand={expand}
          expandLayout="horizontal"
          splitCount={2}
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
            label={selectionSelectLabel}
            params={{
              type: 'advertiser',
              advertiserType,
              advertiserCat: advertiserCatValues,
            }}
          />
          <FormItem name="advertiserCat" label="行业">
            <TagSelect
              options={transformFromGroup(mapObj.appCat)}
              isOptGroup
              // 默认展开
              expand
            />
          </FormItem>
          <FormItem name="serviceChannel" label="投放平台">
            <TagSelect
              options={transformFromTwoLevel(mapObj.serviceChannel)}
              isOptGroup
              expand={expand}
            />
          </FormItem>
          <FormItem name="os" label="操作系统">
            <TagSelect multiple options={transformFromOneLevel(mapObj.os)} />
          </FormItem>
          <FormItem name="amsExposure" label="AMS 曝光">
            <TagSelect
              multiple
              options={transformFromOneLevel(mapObj.amsExposure)}
            />
          </FormItem>
          <FormItem name="ams" label="AMS 在库">
            <TagSelect multiple options={transformFromOneLevel(mapObj.ams)} />
          </FormItem>
        </QueryContainer.QueryForm>
      </Card>
      <QueryTable.Table
        title="分析结果"
        columns={columns}
        rowKey={(_, index) => String(index)}
        toolBarRender={() => {
          return (
            <Popover
              content={
                <Space size="middle" direction="vertical" align="center">
                  <Button
                    type="primary"
                    onClick={onDownloadCallback.bind(this, 'result')}
                  >
                    按分析结果导出
                  </Button>
                  <Button
                    type="primary"
                    onClick={onDownloadCallback.bind(this, 'media')}
                  >
                    按媒体导出
                  </Button>
                </Space>
              }
            >
              <Button>导出</Button>
            </Popover>
          );
        }}
        toolBar={{
          download: false,
        }}
      />
    </QueryTable>
  );
}
App.displayName = 'App';

export default App;
