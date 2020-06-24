import React, { memo } from 'react';
import { Card, Select, Button, Tooltip, Space, Typography } from 'antd';
import {
  QueryContainer,
  FormItem,
  RangePicker,
  TagSelect,
  PictureInfoContainer,
  openConfirmModal,
} from '@tencent/shared-components';
import moment from 'moment';
import getFomatValue from '@tencent/shared-utils/lib/format/getFomatValue';

import SelectionSelect from '$components/SelectionSelect';
import ImgTitleCard from '$components/ImgTitleCard';
import ImgVideoDetail from '$components/ImgVideoDetail';
import useAdertiser from '$src/hooks/useAdertiser';
import axios from '$utils/axios';
import {
  transformFromGroup,
  transformFromOneLevel,
  transformFromTwoLevel,
} from '$utils/mapObjTranform';
import { tagGroupValueToRequestArg } from '$utils/valueToRequestArg';

import styles from './App.module.less';

export const sortData = [
  { value: 'estimate_exposure', label: '按预估曝光升序' },
  { value: '-estimate_exposure', label: '按预估曝光降序' },
  { value: 'first_fetch_time', label: '按首次采集时间升序' },
  { value: '-first_fetch_time', label: '按首次采集时间降序' },
  { value: 'delivery_fetch_duration', label: '按有效投放时长升序' },
  { value: '-delivery_fetch_duration', label: '按有效投放时长降序' },
];

function App() {
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
      // 投放媒体归类于 serviceChannel，为了兼容之前的 api，先把新的serviceChannel拆分为旧的serviceChannel和serviceMedia
      _serviceChannel.push(Number(s));
      _serviceMedia = _serviceMedia.concat(serviceChannel[s]);
    });

    const params = {
      searchContent: {
        advertiserCat: tagGroupValueToRequestArg(advertiserCat),
        advertiserName,
        advertiserType: [4, 1], // 相当于 APP 广告主标记（后端这样定的，当然是用一个类型更好理解）
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
            label="应用名称"
            params={{
              type: 'material',
              advertiserCat: advertiserCatValues,
              advertiserType: [4, 1],
            }}
          />
          <FormItem name="advertiserCat" label="APP分类">
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
        bordered={true}
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
App.displayName = 'App';

/**
 * 这里使用 memo 做了浅层 props 对比，每次查询，这里只会渲染一次，深层的对比目前不是很必要。
 * 比较 dataSource 的数据是后端返回的，有时候渲染一次的速度并不会比对比慢多少，而且后端的数据还可能变化。
 */
export const Content = memo(props => {
  const { data } = props;

  function onPicClick(record) {
    const {
      video,
      advertiserName,
      advertiserType,
      advertiserCat,
      advertiserIcon,
      advFormat,
      firstFetchTime,
      newFetchTime,
      deliveryFetchDuration,
      advSize,
      landpage,
      advTitle,
      img,
      advertiserOs,
    } = record;
    const isVideo = !!video;
    const isVideoVertical = advFormat === '竖版视频';

    openConfirmModal({
      closable: true,
      width: 900,
      content: (
        <ImgVideoDetail
          title={advertiserName}
          isVideo={isVideo}
          isVideoVertical={isVideoVertical}
          avatarUrl={advertiserIcon}
          urls={video ? [video.materialContentVideoPath] : img}
          mainLabelList={[{ value: `${advertiserOs}` }]}
          tagList={[advFormat, advertiserType, advertiserCat]}
          descriptionList={advTitle.map(v => v.proposalAdvTitle)}
          otherLabelList={[
            {
              label: '首次采集时间',
              value: firstFetchTime,
            },
            {
              label: '最新采集时间',
              value: newFetchTime,
            },
            {
              label: '有效投放周期',
              value: deliveryFetchDuration,
            },
            {
              label: '素材尺寸',
              value: advSize,
            },
            {
              label: '落地页',
              value: (
                <>
                  {landpage.map((l, index) => {
                    return (
                      <a
                        key={index.toString()}
                        href={l.landpageUrl}
                        // eslint-disable-next-line react/jsx-no-target-blank
                        target="_blank"
                      >
                        页面{index + 1}
                      </a>
                    );
                  })}
                </>
              ),
            },
          ]}
        />
      ),
      footer: false,
    });
  }

  return (
    <div className={styles.advertisingMaterialContent}>
      {data.map(d => {
        const {
          id,
          advertiserName,
          advertiserOs,
          advertiserCat,
          advFormat,
          firstFetchTime,
          exposureNum,
          estimateExposure,
          deliveryFetchDuration,
          video,
          img,
          serviceChannel,
        } = d;
        return (
          <PictureInfoContainer
            blur
            onClick={onPicClick.bind(null, d)}
            key={id}
            hasPlayButton={!!video}
            posterUrls={img || []}
            title={
              <ImgTitleCard title={advertiserName} channels={serviceChannel} />
            }
            additionalContent={
              <>
                <div>
                  {advertiserOs} | {advertiserCat} | {advFormat}
                </div>
                <div>{firstFetchTime} 首次采集</div>
              </>
            }
            bottomContent={
              <div className={styles.picBottom}>
                <Tooltip title="曝光指数越大，预估曝光也越大">
                  <Space direction="vertical" size={0} align="center">
                    <Typography.Text type="secondary">曝光指数</Typography.Text>
                    <b>{getFomatValue(exposureNum, 'shortNumber(0)')}</b>
                  </Space>
                </Tooltip>
                <Tooltip title="预估曝光越大，实际曝光越大">
                  <Space direction="vertical" size={0} align="center">
                    <Typography.Text type="secondary">预估曝光</Typography.Text>
                    <b>{getFomatValue(estimateExposure, 'shortNumber(0)')}</b>
                  </Space>
                </Tooltip>
                <Tooltip title="投放累计天数，非连续天数">
                  <Space direction="vertical" size={0} align="center">
                    <Typography.Text type="secondary">投放时长</Typography.Text>
                    <b>{deliveryFetchDuration}天</b>
                  </Space>
                </Tooltip>
              </div>
            }
          />
        );
      })}
    </div>
  );
});

export default App;
