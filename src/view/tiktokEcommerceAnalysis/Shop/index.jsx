import React, { useMemo } from 'react';
import { Card, Button, Radio } from 'antd';
import decamelize from 'decamelize';
import moment from 'moment';
import {
  TagSelect,
  QueryTable,
  QueryContainer,
  FormItem,
  DatePicker,
  RangeInputNumber,
} from '@tencent/shared-components';

import useTakeGoods from '$src/hooks/useTakeGoods';
import { transformFromOneLevel } from '$utils/mapObjTranform';
import axios from '$utils/axios';
import SelectionSelect from '$components/SelectionSelect';

import getColumns from './getColumns';

// import styles from './index.module.less';

function Product() {
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
    date,
    dateType,
    queryParams,
  } = useTakeGoods();
  const columns = useMemo(() => {
    return getColumns({ queryParams });
  }, [queryParams]);

  function outerRequest(
    formValues,
    pagination = { pageSize: 10, current: 1 },
    sort = {
      field: 'predictGmv',
      order: 'descend',
    }
  ) {
    const {
      dateType,
      shopName: shopNames = [],
      videoRanges = [],
      productRanges = [],
      gmvRanges = [],
    } = formValues;

    const params = {
      searchContent: {
        startDate,
        endDate,
        shopNames,
        videoRanges,
        productRanges,
        gmvRanges,
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
      .post(`tiktokECommerce/shop/analysis/${dateType}`, params)
      .then(response => {
        const {
          data: {
            data: { shopAnalysisList, pagination },
          },
        } = response;
        return {
          dataSource: shopAnalysisList,
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
            // 【注意】查询条件是 shopNames
            name="shopName"
            label="店铺名称"
            params={{
              dateType,
              startDate,
              endDate,
              type: 'tiktok_shop',
            }}
          />
          <FormItem name="videoRanges" label="带货视频数">
            <RangeInputNumber />
          </FormItem>
          <FormItem name="productRanges" label="带货商品数">
            <RangeInputNumber />
          </FormItem>
          <FormItem name="gmvRanges" label="带货 GMV">
            <RangeInputNumber />
          </FormItem>
          <FormItem name="goodSources" label="商品来源">
            <TagSelect
              multiple
              options={transformFromOneLevel(mapObj.tiktokGoodsSources)}
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
            <Button onClick={onDownload.bind(this, 'tiktok_shop')}>导出</Button>
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

export default Product;
