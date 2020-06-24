import React, { useState, useMemo, useCallback } from 'react';
import { Card, Button, Select } from 'antd';
import {
  QueryTable,
  QueryContainer,
  FormItem,
  RangePicker,
  RangeInputNumber,
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

import { getProductColumns } from './columns';

const newList = [
  {
    array: [
      { label: '是', id: 1 },
      { label: '否', id: 0 },
    ],
  },
];
const salesTypeList = [
  {
    id: 1,
    label: '昨日新增销量',
  },
  {
    id: 3,
    label: '3日新增销量',
  },
  {
    id: 7,
    label: '7日新增销量',
  },
  {
    id: 15,
    label: '15日新增销量',
  },
];

function dataAdapter(data) {
  return data.map(d => {
    const lineData = { date: [], data: [] };
    const shopLineData = { date: [], data: [] };
    const {
      saleVolumeFlow,
      dpaShopInfo = {},
      salesIncMin: min,
      salesIncMax: max,
    } = d;
    // 处理全网销量趋势
    if (saleVolumeFlow && saleVolumeFlow.length) {
      saleVolumeFlow.forEach(v => {
        if (v.subItem && v.subItem.saleVolume) {
          lineData.date.push(v.date);
          lineData.data.push(v.subItem.saleVolume);
        }
        // -1 说明是没有限制，销量区间的最大最小值，根据这个来用不同的颜色来区分是否在制定查询区间内
        if (min !== -1) {
          lineData.min = min;
        }
        if (max !== -1) {
          lineData.max = max;
        }
      });
    }
    // 处理内部商品信息
    if (dpaShopInfo) {
      const { internelSaleVolumeFlow = [] } = dpaShopInfo;
      if (internelSaleVolumeFlow) {
        internelSaleVolumeFlow.forEach(v => {
          if (v.subItem && v.subItem.saleVolume) {
            shopLineData.date.push(v.date);
            shopLineData.data.push(v.subItem.saleVolume);
          }
        });
      }
    }
    d.lineData = lineData;
    d.shopLineData = shopLineData;
    return d;
  });
}

function Page(props) {
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
    queryParams,
  } = useAdertiser({ dateCheckType: 'merchant' });
  const [salesIncVisible, setSalesIncVisible] = useState();
  const [salesIncColumnsVisible, setSalesIncColumnsVisible] = useState();
  const columns = useMemo(() => {
    return getProductColumns({ salesIncColumnsVisible, queryParams });
  }, [salesIncColumnsVisible, queryParams]);

  const outerRequest = useCallback(
    (
      formValues,
      pagination = { pageSize: 10, current: 1 },
      sort = {
        field: 'materialEstimateExposure',
        order: 'descend',
      }
    ) => {
      const {
        goodsType = [],
        productCat = [],
        advFormat = [],
        isNew = [],
        isAms = [],
        daterange,
        salesVolumeRange: [salesVolumeMin, salesVolumeMax] = [],
        salesIncType,
        salesIncRange: [salesIncMin, salesIncMax] = [],
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

      const salesIncData = salesIncVisible
        ? {
            salesIncType,
            salesIncMin,
            salesIncMax,
          }
        : {};

      const params = {
        searchContent: {
          advFormat,
          goodsType,
          productCat: tagGroupValueToRequestArg(productCat),
          productType: _productType,
          serviceMedia: _serviceMedia,
          isNew,
          isAms,

          salesVolumeMin,
          salesVolumeMax,

          startDate: daterange[0],
          endDate: daterange[1],
          sysSearchType: 'commodity_analysis',

          ...salesIncData,
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
        setSalesIncColumnsVisible(salesIncVisible);
        return {
          dataSource: dataAdapter(data),
          pagination: {
            total: pagination.total,
          },
        };
      });
    },
    [refContainer, salesIncVisible]
  );

  const salesIncType = useMemo(
    () =>
      salesIncVisible && (
        <FormItem name="salesIncType" label="新增销量类型">
          <Select>
            {salesTypeList.map(val => (
              <Select.Option key={val.id} value={val.id}>
                {val.label}
              </Select.Option>
            ))}
          </Select>
        </FormItem>
      ),
    [salesIncVisible]
  );
  const salesIncRange = useMemo(
    () =>
      salesIncVisible && (
        <FormItem name="salesIncRange" label="新增销量">
          <RangeInputNumber
            minProps={{ placeholder: 0, min: 0, max: 100000000 }}
            maxProps={{ placeholder: 100000000, min: 1, max: 100000000 }}
          />
        </FormItem>
      ),
    [salesIncVisible]
  );

  const onFormValuesChange = useCallback(changedValues => {
    if ('daterange' in changedValues) {
      const [start, end] = changedValues.daterange;
      setSalesIncVisible(
        start.format('YYYY-MM-DD') === end.format('YYYY-MM-DD')
      ); // 仅当时间范围为同一天时, 显示"新增销量"
    }
  }, []);

  return (
    <QueryTable request={outerRequest} onMount={onMount} onSubmit={onSubmit}>
      <Card bordered={false}>
        <QueryContainer.QueryForm
          form={form}
          expand={expand}
          onValuesChange={onFormValuesChange}
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
            name="productName"
            label="商品名称"
            params={{
              type: 'merchant',
              goodsCate2Id: [],
              goodsCateId: [],
            }}
          />
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
          <FormItem name="isNew" label="新品">
            <TagSelect multiple options={transformFromOneLevel(newList)} />
          </FormItem>
          <FormItem name="isAms" label="商品在库">
            <TagSelect multiple options={transformFromOneLevel(mapObj.ams)} />
          </FormItem>
          <FormItem name="salesVolumeRange" label="销售区间">
            <RangeInputNumber
              minProps={{ placeholder: 0, min: 0, max: 100000000 }}
              maxProps={{ placeholder: 100000000, min: 1, max: 100000000 }}
            />
          </FormItem>
          {salesIncType}
          {salesIncRange}
        </QueryContainer.QueryForm>
      </Card>
      <QueryTable.Table
        title="分析结果"
        columns={columns}
        rowKey={(_, index) => String(index)}
        toolBarRender={() => {
          return <Button onClick={onDownload.bind(this, 'goods')}>导出</Button>;
        }}
        toolBar={{
          download: false,
        }}
      />
    </QueryTable>
  );
}
Page.displayName = 'EcommerceProduct';

export default Page;
