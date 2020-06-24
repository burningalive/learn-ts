import React, { useMemo } from 'react';
import { Card, Button } from 'antd';
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
  // transformFromGroup,
  transformFromOneLevel,
  transformFromTwoLevel,
} from '$utils/mapObjTranform';
import { tagGroupValueToRequestArg } from '$utils/valueToRequestArg';

import { getCategoryColumns } from './columns';

function Page() {
  const {
    form,
    mapObj,
    expand,
    refContainer,
    disabledDate,
    onSubmit,
    onMount,
    onDownload,
    queryParams,
    daterangeInitailValue,
  } = useAdertiser({ dateCheckType: 'merchant' });

  function outerRequest(
    formValues,
    pagination = { pageSize: 10, current: 1 },
    sort = {
      field: 'materialEstimateExposure',
      order: 'descend',
    }
  ) {
    const {
      goodsType = [],
      productCat = [],
      advFormat = [],
      serviceChannel = {},
    } = formValues;
    const _productType = [];
    const _serviceChannel = [];
    let _serviceMedia = [];
    Object.keys(serviceChannel).forEach(s => {
      // 其中归类于 serviceChannel，为了兼容之前的 api，先把新的serviceChannel拆分为旧的serviceChannel和serviceMedia
      _serviceChannel.push(s);
      _serviceMedia = _serviceMedia.concat(serviceChannel[s]);
    });
    Object.keys(productCat).forEach(s => {
      _productType.push(s);
    });
    const params = {
      searchContent: {
        advFormat,
        goodsType,
        productCat: tagGroupValueToRequestArg(productCat),
        productType: _productType,
        serviceMedia: _serviceMedia,
        startDate: formValues.daterange[0],
        endDate: formValues.daterange[1],
        sysSearchType: 'category_analysis',
        // serviceChannel: _serviceChannel,
      },
      pagination: {
        pageSize: pagination.pageSize,
        current: pagination.current,
      },
      sort: {
        // 后端的接口统一为下划线，前端转换为了驼峰式，需要转换。
        field: decamelize(sort.field),
        desc: sort.order === 'descend',
      },
    };

    refContainer.current.submitValues = params;

    return axios.post('merchant/list', params).then(response => {
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
  const columns = useMemo(() => {
    return getCategoryColumns({ queryParams });
  }, [queryParams]);

  return (
    <QueryTable request={outerRequest} onMount={onMount} onSubmit={onSubmit}>
      <Card bordered={false}>
        <QueryContainer.QueryForm
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
            name="goodsType"
            label="品类名称"
            params={{
              type: 'goods_type',
              goodsCate2Id: [],
              goodsCateId: [],
            }}
          />
          <FormItem name="productCat" label="行业">
            <TagSelect
              options={transformFromTwoLevel(mapObj.productCat)}
              isOptGroup
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
        </QueryContainer.QueryForm>
      </Card>
      <QueryTable.Table
        title="分析结果"
        columns={columns}
        rowKey={(_, index) => String(index)}
        toolBarRender={() => {
          return (
            <Button onClick={onDownload.bind(this, 'goods_type')}>导出</Button>
          );
        }}
        toolBar={{
          download: false,
        }}
      />
    </QueryTable>
  );
}
Page.displayName = 'EcommerceCategory';

export default Page;
