import React, { memo, useMemo } from 'react';
import {
  QueryContainer,
  FormItem,
  RangePicker,
  QueryForm,
  RechartTool,
} from '@tencent/shared-components';
import { Space } from 'antd';
import { useLocation, useHistory, useRouteMatch } from 'react-router-dom';
import moment from 'moment';
import getDateRangeByDateType from '$utils/getDateRangeByDateType';
import getQueryParams from '@tencent/shared-utils/lib/url/getQueryParams';

import axios from '$utils/axios';

import styles from './Details.module.less';

function ProductHeat() {
  const location = useLocation();
  const history = useHistory();
  const [form] = QueryForm.useForm();
  const queryParams = getQueryParams(location.search);
  const {
    params: { goodsId },
  } = useRouteMatch();
  const { startDate, endDate } = useMemo(() => {
    const daterange = getDateRangeByDateType(
      queryParams.date,
      queryParams.dateType
    );
    return {
      startDate: daterange[0],
      endDate: daterange[1],
    };
  }, [queryParams.date, queryParams.dateType]);

  function outerRequest(formValues) {
    const { daterange } = formValues;
    const params = {
      searchContent: {
        startDate: daterange[0],
        endDate: daterange[1],
        goodsId,
      },
    };

    return axios
      .post(`tiktokECommerce/goodsHeatAnalysis`, params)
      .then(({ data: { data } }) => {
        return {
          // dataAdaper 放在这里最合适，尽量不要放在 render 函数里面，render 是可能多次执行的。
          dataSource: dataAdapter(data),
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
      useContentCard={false}
    >
      <QueryContainer.QueryForm form={form}>
        <FormItem
          name="daterange"
          label="日期"
          required
          initialValue={[startDate, endDate]}
          submitFormatter={values => {
            return [
              moment(values[0]).format('YYYY-MM-DD'),
              moment(values[1]).format('YYYY-MM-DD'),
            ];
          }}
        >
          <RangePicker />
        </FormItem>
      </QueryContainer.QueryForm>
      <QueryContainer.Content>
        {({ result }) => {
          return <Content result={result} />;
        }}
      </QueryContainer.Content>
    </QueryContainer>
  );
}
ProductHeat.displayName = 'ProductHeat';

const Content = memo(props => {
  const {
    result: { dataSource },
  } = props;

  return (
    <Space size="middle" direction="vertical" className={styles.charts}>
      {dataSource.map(d => {
        return (
          <RechartTool
            key={d.title}
            title={d.title}
            type="line"
            data={d}
            yAxisFormat={d.format}
          />
        );
      })}
    </Space>
  );
});

function dataAdapter(data) {
  return data.map(d => {
    return {
      title: d.title,
      // format: rmb(0)
      format: d.unit ? `${d.unit}(0)` : undefined,
      dataKeys: [
        {
          dataKey: 'value',
          name: d.title,
        },
      ],
      chartData: d.data.map(v => {
        return {
          value: v.subItem.count,
          name: v.date,
        };
      }),
    };
  });
}

export default memo(ProductHeat);
