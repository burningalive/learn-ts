import React, { useState, useMemo, memo } from 'react';
import { Card, Select, Button, Tooltip, Space, Typography } from 'antd';
import {
  QueryContainer,
  FormItem,
  RangePicker,
  TagSelect,
  PictureInfoContainer,
  openConfirmModal,
  queryParamsToFormValues,
} from '@tencent/shared-components';
import moment from 'moment';
import getFomatValue from '@tencent/shared-utils/lib/format/getFomatValue';

import SelectionSelect from '$components/SelectionSelect';
import ImgTitleCard from '$components/ImgTitleCard';
import ImgVideoDetail from '$components/ImgVideoDetail';
import useAdertiser from '$src/hooks/useAdertiser';
import axios from '$utils/axios';
import {
  transformFromOneLevel,
  transformFromTwoLevel,
} from '$utils/mapObjTranform';
import {
  tagGroupValueToRequestArg,
  tagGroupValueToReturnKey,
} from '$utils/valueToRequestArg';

// ortData 和 App  的一样
import { sortData } from './App';

import styles from './App.module.less';

function Direct() {
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
  const defaultCates = useMemo(() => {
    const _cates = {};
    if (queryParams.productCat) {
      const productCat = queryParamsToFormValues({
        productCat: queryParams.productCat,
      }).productCat;

      _cates.goodsCate2Id = tagGroupValueToRequestArg(productCat);
      _cates.goodsCateId = tagGroupValueToReturnKey(productCat);
    }
    return _cates;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [cates, setCates] = useState(defaultCates);
  function outerRequest(
    formValues,
    pagination = { pageSize: 10, current: 1 },
    sort = {
      field: 'estimate_exposure',
      order: 'descend',
    }
  ) {
    const {
      productCat = [],
      productName = [],
      advFormat = [],
      serviceChannel = {},
      os = [],
    } = formValues;
    const _serviceChannel = [];
    let _serviceMedia = [];
    Object.keys(serviceChannel).forEach(s => {
      // 其中归类于 serviceChannel，为了兼容之前的 api，先把新的serviceChannel拆分为旧的serviceChannel和serviceMedia
      _serviceChannel.push(Number(s));
      _serviceMedia = _serviceMedia.concat(serviceChannel[s]);
    });
    const params = {
      searchContent: {
        advFormat,
        productCat: tagGroupValueToRequestArg(productCat), // 二级行业
        productName,
        productType: tagGroupValueToReturnKey(productCat), // 一级行业id
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

    return axios.post('merchant/detail', params).then(response => {
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

  function onChangeProductCat(params) {
    const goodsCate2Id = tagGroupValueToRequestArg(params);
    const goodsCateId = tagGroupValueToReturnKey(params);
    setCates({ goodsCateId, goodsCate2Id });
  }

  const { goodsCateId = [], goodsCate2Id = [] } = cates;

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
              goodsCateId, // 一级行业
              goodsCate2Id, // 二级行业
            }}
          />
          <FormItem name="productCat" label="APP 分类">
            <TagSelect
              onChange={onChangeProductCat}
              options={transformFromTwoLevel(mapObj.productCat)}
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
        title="分析结果"
        extra={
          <div>
            <Button onClick={onDownload.bind(this, 'goods_detail')}>
              导出
            </Button>
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
Direct.displayName = 'Direct';

const Content = memo(props => {
  const { data } = props;

  function onPicClick(record) {
    const {
      materialVideo,
      advertiserName,
      cate,
      cate2,
      advertiserIcon,
      materialAdvFormat,
      materialFirstFetchTime,
      materialNewFetchTime,
      materialDeliveryFetchDuration,
      advSize,
      landpage,
      materialImg,
      advertiserOs,
    } = record;
    const isVideo = !!materialVideo;
    const isVideoVertical = materialAdvFormat === '竖版视频';

    openConfirmModal({
      closable: true,
      width: 900,
      content: (
        <ImgVideoDetail
          title={advertiserName}
          isVideo={isVideo}
          isVideoVertical={isVideoVertical}
          avatarUrl={advertiserIcon}
          urls={
            materialVideo
              ? [materialVideo.materialContentVideoPath]
              : materialImg
          }
          mainLabelList={[{ value: `${advertiserOs}` }]}
          tagList={[materialAdvFormat, cate, cate2]}
          otherLabelList={[
            {
              label: '首次采集时间',
              value: materialFirstFetchTime,
            },
            {
              label: '最新采集时间',
              value: materialNewFetchTime,
            },
            {
              label: '有效投放周期',
              value: materialDeliveryFetchDuration,
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
          goodsMaterialId,
          advertiserName,
          advertiserOs,
          goodsAdvertiserCat,
          materialAdvFormat,
          materialFirstFetchTime,
          exposureNum,
          estimateExposure,
          materialDeliveryFetchDuration,
          materialVideo,
          materialImg,
          materialServiceChannel,
        } = d;
        return (
          <PictureInfoContainer
            blur
            onClick={onPicClick.bind(null, d)}
            key={goodsMaterialId}
            hasPlayButton={!!materialVideo}
            posterUrls={materialImg || []}
            title={
              <ImgTitleCard
                title={advertiserName}
                channels={[materialServiceChannel]}
              />
            }
            additionalContent={
              <>
                <div>
                  {advertiserOs} | {goodsAdvertiserCat} | {materialAdvFormat}
                </div>
                <div>{materialFirstFetchTime} 首次采集</div>
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
                    <b>{materialDeliveryFetchDuration}天</b>
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

export default Direct;
