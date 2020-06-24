import React from 'react';
import {
  QueryContainer,
  FormItem,
  RangePicker,
  TagSelect,
} from '@tencent/shared-components';
import { Select } from 'antd';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
import decamelize from 'decamelize';

import { namespace as globalDataNamespace } from '$mutations/api/globalData';
import axios from '$utils/axios';
import {
  transformFromOneLevel,
  transformFromTwoLevel,
} from '$utils/mapObjTranform';

import styles from './Details.module.less';

function QueryDetailContainer(props) {
  const {
    goodsAdvertiserId,
    productId,
    children,
    url,
    // 投放趋势没有分页和排序
    noSorterPagination,
    noAdvFormat,
  } = props;
  const location = useLocation();
  const history = useHistory();
  const { mapObj } = useSelector(state => state[globalDataNamespace]);

  function outerRequest(
    formValues,
    pagination,
    sorter = {
      field: 'estimateExposure',
      order: 'descend',
    }
  ) {
    const { advFormat = [], serviceChannel = {} } = formValues;
    const _serviceChannel = [];
    let _serviceMedia = [];
    Object.keys(serviceChannel).forEach(s => {
      // 其中归类于 serviceChannel，为了兼容之前的 api，先把新的serviceChannel拆分为旧的serviceChannel和serviceMedia
      _serviceChannel.push(s);
      _serviceMedia = _serviceMedia.concat(serviceChannel[s]);
    });

    const params = {
      searchContent: {
        goodsAdvertiserId,
        productId,
        advFormat: noAdvFormat ? undefined : advFormat,
        serviceChannel: _serviceChannel,
        serviceMedia: _serviceMedia,
        startDate: formValues.daterange[0],
        endDate: formValues.daterange[1],
      },
      pagination: !noSorterPagination && {
        pageSize: pagination.pageSize,
        current: pagination.current,
      },
      sort: !noSorterPagination && {
        // 后端的接口统一为下划线，前端转换为了驼峰式，需要转换。
        field: decamelize(sorter.field),
        desc: sorter.order === 'descend',
      },
    };

    return axios.post(url, params).then(({ data: { data, pagination } }) => {
      return {
        dataSource: data,
        pagination: !noSorterPagination && { total: pagination.total },
      };
    });
  }

  function onSubmit({ flattedQueryParams }) {
    const queryStirng = new URLSearchParams(flattedQueryParams).toString();
    history.replace(`${location.pathname}?${decodeURIComponent(queryStirng)}`);
  }

  function onMount(params, submit, validErr) {
    if (!validErr) {
      // url 参数符合条件，触发查询
      submit();
    }
  }

  return (
    <QueryContainer
      request={outerRequest}
      onMount={onMount}
      onSubmit={onSubmit}
      useContentCard={!noSorterPagination}
    >
      <QueryContainer.QueryForm
        splitCount={1}
        expand={true}
        expandLayout="horizontal"
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
        >
          <RangePicker />
        </FormItem>
        <FormItem name="serviceChannel" label="投放平台">
          <TagSelect
            options={transformFromTwoLevel(mapObj.serviceChannel)}
            isOptGroup
          />
        </FormItem>
        {!noAdvFormat && (
          <FormItem name="advFormat" label="广告形态">
            <TagSelect
              options={transformFromOneLevel(mapObj.advFormat)}
              multiple
            />
          </FormItem>
        )}
      </QueryContainer.QueryForm>
      <QueryContainer.Content
        type="inner"
        bordered={noSorterPagination ? null : true}
        title="查询结果"
        extra={
          noSorterPagination ? null : (
            <QueryContainer.SorterSelect
              className={styles.sorterSelect}
              defaultValue="-estimateExposure"
            >
              <Select.Option value="estimateExposure">
                按预估曝光升序
              </Select.Option>
              <Select.Option value="-estimateExposure">
                按预估曝光降序
              </Select.Option>
              <Select.Option value="firstFetchTime">
                按首次采集时间升序
              </Select.Option>
              <Select.Option value="-firstFetchTime">
                按首次采集时间降序
              </Select.Option>
              <Select.Option value="deliveryFetchDuration">
                按有效投放时长升序
              </Select.Option>
              <Select.Option value="-deliveryFetchDuration">
                按有效投放时长降序
              </Select.Option>
            </QueryContainer.SorterSelect>
          )
        }
      >
        {({ result }) => {
          return React.cloneElement(children, { result: result.dataSource });
        }}
        {!noSorterPagination && <QueryContainer.Pagination />}
      </QueryContainer.Content>
    </QueryContainer>
  );
}
QueryDetailContainer.displayName = 'QueryDetailContainer';

export default QueryDetailContainer;
