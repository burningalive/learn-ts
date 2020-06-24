import React, { useMemo } from 'react';
import { Card, Button, Radio } from 'antd';
import decamelize from 'decamelize';
import moment from 'moment';
import {
  QueryTable,
  QueryContainer,
  FormItem,
  DatePicker,
  TagSelect,
  RangeInputNumber,
} from '@tencent/shared-components';

import useTakeGoods from '$src/hooks/useTakeGoods';
import {
  transformFromOneLevel,
  transformFirstLevelFromTwoLevel,
} from '$utils/mapObjTranform';
import axios from '$utils/axios';
import SelectionSelect from '$components/SelectionSelect';

import getColumns from './getColumns';

// import styles from './index.module.less';

function Product(props) {
  const { shopId } = props;
  const {
    form,
    mapObj,
    expand,
    refContainer,
    onSubmit,
    onMount,
    onDownload,
    startDate,
    endDate,
    onValuesChange,
    queryParams,
    date,
    dateType,
  } = useTakeGoods();

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
      dateType,
      goodsTitle: goodsTitles = [],
      tiktokGoodsSources = [],
      productType = [],
      isNew = [],
      salesVolume: [salesVolumeMin, salesVolumeMax] = [],
      salesInc: [salesIncMin, salesIncMax] = [],
    } = formValues;

    const params = {
      searchContent: {
        startDate,
        endDate,
        tiktokGoodsSources,
        goodsTitles,
        productType,
        isNew,
        salesVolumeMin,
        salesVolumeMax,
        salesIncMin,
        salesIncMax,
        shopId,
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

    return axios
      .post(`tiktokECommerce/productAnalysislist/${dateType}`, params)
      .then(response => {
        const {
          data: {
            data: { goodsAnalysisList, pagination },
          },
        } = response;
        return {
          dataSource: dataAdapter(goodsAnalysisList),
          pagination: {
            total: pagination.total,
          },
        };
      });
  }

  return (
    <QueryTable request={outerRequest} onMount={onMount} onSubmit={onSubmit}>
      <Card bordered={false}>
        <QueryContainer.QueryForm
          form={form}
          expand={expand}
          expandLayout="horizontal"
          splitCount={3}
          onValuesChange={onValuesChange}
        >
          <FormItem name="dateType" label="榜单" required initialValue="day">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="day">日榜</Radio.Button>
              <Radio.Button value="week">周榜</Radio.Button>
              <Radio.Button value="month">月榜</Radio.Button>
            </Radio.Group>
          </FormItem>
          <FormItem
            name="date"
            label="日期"
            required
            initialValue={date}
            submitFormatter={value => {
              return moment(value).format('YYYY-MM-DD');
            }}
          >
            <DatePicker
              picker={dateType !== 'day' ? dateType : undefined}
              // 这里得加key，每次切换重新渲染
              key={dateType}
            />
          </FormItem>
          <SelectionSelect
            // 【注意】查询条件时 goodsTitles
            name="goodsTitle"
            label="商品名称"
            params={{
              dateType,
              startDate,
              endDate,
              type: 'tiktok_goods',
              shopId,
            }}
          />
          <FormItem name="productType" label="行业">
            <TagSelect
              multiple
              options={transformFirstLevelFromTwoLevel(
                mapObj.tiktokGoodsCategory
              )}
              showMoreOption
              expand={true}
            />
          </FormItem>
          <FormItem name="goodSources" label="商品来源">
            <TagSelect
              multiple
              options={transformFromOneLevel(mapObj.tiktokGoodsSources)}
            />
          </FormItem>
          <FormItem name="isNew" label="是否是新品">
            <TagSelect
              multiple
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </FormItem>
          <FormItem name="salesVolume" label="销量区间">
            <RangeInputNumber
              minProps={{ placeholder: 0, min: 0, max: 100000000 }}
              maxProps={{ placeholder: 100000000, min: 1, max: 100000000 }}
            />
          </FormItem>
          <FormItem name="salesInc" label="新增销量">
            <RangeInputNumber
              minProps={{ placeholder: 0, min: 0, max: 100000000 }}
              maxProps={{ placeholder: 100000000, min: 1, max: 100000000 }}
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
            <Button onClick={onDownload.bind(this, 'tiktok_product')}>
              导出
            </Button>
          );
        }}
        toolBar={{
          download: false,
        }}
      />
    </QueryTable>
  );
}
Product.displayName = 'Product';

function dataAdapter(data = []) {
  return data.map(d => {
    if (d.saleVolumeFlow && d.saleVolumeFlow.length > 0) {
      // 累积销量折线图
      d.cumulativeSales = {
        dataKeys: [{ dataKey: 'value', name: '累积销量' }],
        chartData: [],
      };
      d.saleVolumeFlow.forEach(v => {
        d.cumulativeSales.chartData.push({
          value: v.subItem.saleVolume,
          name: v.date,
        });
      });
    }

    return {
      ...d,
    };
  });
}

export default Product;
