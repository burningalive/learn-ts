import React, { useMemo } from 'react';
import { Card, Button, Radio } from 'antd';
import decamelize from 'decamelize';
import moment from 'moment';
import {
  QueryTable,
  QueryContainer,
  FormItem,
  DatePicker,
  Select,
  TagSelect,
} from '@tencent/shared-components';

import useTakeGoods from '$src/hooks/useTakeGoods';
import { transformFromOneLevel } from '$utils/mapObjTranform';
import axios from '$utils/axios';

import getColumns from './getColumns';

// import styles from './index.module.less';

function Industry() {
  const {
    form,
    mapObj,
    expand,
    refContainer,
    onSubmit,
    onMount,
    onDownload,
    onValuesChange,
    date,
    dateType,
    startDate,
    endDate,
    queryParams,
  } = useTakeGoods();
  const columns = useMemo(() => {
    return getColumns({ queryParams });
  }, [queryParams]);
  const industryNameOptions = useMemo(() => {
    return mapObj.tiktokGoodsCategory.map(industry => {
      return {
        value: String(industry.id),
        label: industry.label,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function outerRequest(
    formValues,
    pagination = { pageSize: 10, current: 1 },
    sort = {
      field: 'estimateExposure',
      order: 'descend',
    }
  ) {
    const { dateType, goodSources = [], industryNameId = [] } = formValues;

    const params = {
      searchContent: {
        startDate,
        endDate,
        goodSources,
        industryNameId,
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
      .post(`tiktokECommerce/industry/analysis/${dateType}`, params)
      .then(response => {
        const {
          data: {
            data: { industryAnalysisList, pagination },
          },
        } = response;
        return {
          dataSource: industryAnalysisList,
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
          <FormItem name="industryNameId" label="行业名称">
            <Select
              options={industryNameOptions}
              mode="multiple"
              showArrow
              allowClear
            />
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
            <Button onClick={onDownload.bind(this, 'tiktok_industry')}>
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
Industry.displayName = 'Industry';

export default Industry;
