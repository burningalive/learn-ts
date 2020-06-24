import React, { useMemo, useRef, useState } from 'react';
import { Card, Space, Typography, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import decamelize from 'decamelize';
import { useSelector } from 'react-redux';
import moment from 'moment';
import {
  QueryTable,
  QueryContainer,
  FormItem,
  DatePicker,
  TagSelect,
} from '@tencent/shared-components';

import useQueryContainer from '$src/hooks/useQueryContainer';
import { transformFromOneLevel } from '$utils/mapObjTranform';
import axios from '$utils/axios';
import { namespace as globalDataNamespace } from '$mutations/api/globalData';

import getColumns from './getColumns';

import styles from './index.module.less';

const fistValue = '人气总榜';

function GoodList() {
  const { form, queryParams, onMount, onSubmit } = useQueryContainer({
    requiredFields: ['date'],
  });
  const { mapObj } = useSelector(state => state[globalDataNamespace]);
  const columns = useMemo(() => {
    return getColumns({ queryParams });
  }, [queryParams]);
  const refContainer = useRef({ submitValues: {} });
  const [updateInfo, setUpdateInfo] = useState({});
  // 人气总榜需要放在第一位
  const categoryOptions = useMemo(() => {
    const _categoryOptions = transformFromOneLevel(mapObj.category).filter(
      v => {
        if (v.id === fistValue) {
          return false;
        }
        return true;
      }
    );
    _categoryOptions.unshift({
      value: fistValue,
      label: fistValue,
    });
    return _categoryOptions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function outerRequest(
    formValues,
    pagination = { pageSize: 10, current: 1 },
    sort = {
      field: 'rankNo',
      order: 'descend',
    }
  ) {
    const { date, category } = formValues;

    const params = {
      searchContent: {
        dateStr: date,
        category,
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

    return axios.post(`tiktokECommerce/goodList`, params).then(response => {
      const {
        data: {
          data: { goodsList, pagination, lastUpdateTime, dailyUpdateTime },
        },
      } = response;

      setUpdateInfo({
        lastUpdateTime: moment(lastUpdateTime).format(
          'YYYY 年 MM 月 DD 日 HH 时'
        ),
        dailyUpdateTime: dailyUpdateTime.split(':')[0],
      });

      return {
        dataSource: goodsList,
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
          expand={true}
          expandLayout="horizontal"
          splitCount={3}
        >
          <FormItem
            name="date"
            label="日期"
            required
            initialValue={moment().subtract(1, 'day')}
            submitFormatter={value => {
              return moment(value).format('YYYY-MM-DD');
            }}
          >
            <DatePicker />
          </FormItem>
          <FormItem name="category" label="类目榜单" initialValue={fistValue}>
            <TagSelect options={categoryOptions} showMoreOption expand />
          </FormItem>
        </QueryContainer.QueryForm>
      </Card>
      <QueryTable.Table
        title={
          <Space size="middle">
            <span>查询结果</span>
            <Tooltip
              title={
                <>
                  每天 {updateInfo.dailyUpdateTime} 时更新数据，最近更新时间为{' '}
                  {updateInfo.lastUpdateTime}
                </>
              }
              placement="right"
            >
              <Typography.Link className={styles.dataDec}>
                <Space>
                  <QuestionCircleOutlined />
                  <span>数据说明</span>
                </Space>
              </Typography.Link>
            </Tooltip>
          </Space>
        }
        columns={columns}
        rowKey={(_, index) => String(index)}
        toolBar={{
          download: false,
        }}
      />
    </QueryTable>
  );
}
GoodList.displayName = 'GoodList';

export default GoodList;
