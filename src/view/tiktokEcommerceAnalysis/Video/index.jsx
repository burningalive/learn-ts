import React, { memo } from 'react';
import {
  Tooltip,
  Table,
  Card,
  Select,
  Button,
  Radio,
  Space,
  Typography,
} from 'antd';
import moment from 'moment';
import {
  PictureInfoContainer,
  QueryContainer,
  FormItem,
  DatePicker,
  TagSelect,
  openConfirmModal,
} from '@tencent/shared-components';
import getFomatValue from '@tencent/shared-utils/lib/format/getFomatValue';

import ImgVideoDetail from '$components/ImgVideoDetail';
import SelectionSelect from '$components/SelectionSelect';
import ShopInfo from '$components/ShopInfo';
import useTakeGoods from '$src/hooks/useTakeGoods';
import { transformFirstLevelFromTwoLevel } from '$utils/mapObjTranform';
import axios from '$utils/axios';

import styles from './index.module.less';

const { Text } = Typography;
const { Column } = Table;

function Video(props) {
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
    date,
    dateType,
  } = useTakeGoods();

  function outerRequest(
    formValues,
    pagination = { pageSize: 10, current: 1 },
    sort = {
      field: 'video_digg_count',
      order: 'descend',
    }
  ) {
    const {
      dateType,
      videoTitle: videoTitles = [],
      productType = [],
    } = formValues;

    const params = {
      searchContent: {
        startDate,
        endDate,
        videoTitles,
        productType,
        shopId,
      },
      pagination: {
        pageSize: pagination.pageSize,
        current: pagination.current,
      },
      sort: {
        field: sort.field,
        desc: sort.order === 'descend',
      },
    };

    refContainer.current.submitValues = params;

    return axios
      .post(`tiktokECommerce/goodsMaterialAnalysis/${dateType}`, params)
      .then(response => {
        const {
          data: {
            data: { goodsMaterialAnalysisList, pagination },
          },
        } = response;
        return {
          dataSource: goodsMaterialAnalysisList,
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
            // 【注意】查询条件是 videoTitles
            name="videoTitle"
            label="视频名称"
            params={{
              dateType,
              startDate,
              endDate,
              type: 'tiktok_material',
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
        </QueryContainer.QueryForm>
      </Card>
      <QueryContainer.Content
        type="inner"
        bordered={true}
        title="查询结果"
        extra={
          <Space>
            <Button onClick={onDownload.bind(this, 'onDownloa')}>导出</Button>
            <QueryContainer.SorterSelect
              className={styles.sorterSelect}
              defaultValue="-video_digg_count"
            >
              <Select.Option value="video_create_time">
                按发布时间升序
              </Select.Option>
              <Select.Option value="-video_create_time">
                按发布时间降序
              </Select.Option>
              <Select.Option value="video_digg_count">
                按点赞数升序
              </Select.Option>
              <Select.Option value="-video_digg_count">
                按点赞数降序
              </Select.Option>
              <Select.Option value="video_digg_count_amplitude">
                按点赞数增量升序
              </Select.Option>
              <Select.Option value="-video_digg_count_amplitude">
                按点赞数增量降序
              </Select.Option>
              <Select.Option value="video_share_count">
                按分享数升序
              </Select.Option>
              <Select.Option value="-video_share_count">
                按分享数降序
              </Select.Option>
              <Select.Option value="video_share_count_amplitude">
                按分享数增量升序
              </Select.Option>
              <Select.Option value="-video_share_count_amplitude">
                按分享数增量降序
              </Select.Option>
              <Select.Option value="video_comment_count">
                按评论数升序
              </Select.Option>
              <Select.Option value="-video_comment_count">
                按评论数降序
              </Select.Option>
              <Select.Option value="video_comment_count_amplitude">
                按点评论数增量升序
              </Select.Option>
              <Select.Option value="-video_comment_count_amplitude">
                按评论数增量降序
              </Select.Option>
            </QueryContainer.SorterSelect>
          </Space>
        }
      >
        {({ result }) => {
          return <Content result={result} />;
        }}
        <QueryContainer.Pagination />
      </QueryContainer.Content>
    </QueryContainer>
  );
}
Video.displayName = 'Video';

const Content = memo(props => {
  const {
    result: { dataSource },
  } = props;

  function onPicClick(record) {
    const {
      authorName,
      authorAvatarPath,
      videoPlayPath,
      videoDiggCount,
      videoShareCount,
      videoCommentCount,
      videoCreateTime,
      musicTitle,
      goodsList = [],
    } = record;
    const isVideo = true;

    openConfirmModal({
      closable: true,
      width: 1240,
      content: (
        <ImgVideoDetail
          title={<>主播{authorName}</>}
          isVideo={isVideo}
          avatarUrl={authorAvatarPath}
          urls={[videoPlayPath]}
          mainLabelList={[
            {
              value: getFomatValue(videoDiggCount, 'shortNumber(0)'),
              label: '点赞数：',
            },
            {
              value: getFomatValue(videoShareCount, 'shortNumber(0)'),
              label: '分享数：',
            },
            {
              value: getFomatValue(videoCommentCount, 'shortNumber(0)'),
              label: '评论数：',
            },
          ]}
          otherLabelList={[
            {
              label: '视频发布时间',
              value: videoCreateTime,
            },
            {
              label: '视频音乐',
              value: musicTitle,
            },
          ]}
          bottomContent={<ShopInfoTable dataSource={goodsList} />}
        />
      ),
      footer: false,
    });
  }

  return (
    <div className={styles.relatedVideoContent}>
      {dataSource.map((d, index) => {
        const {
          goodsTitle,
          videoCoverPath,
          authorName,
          videoCreateTime,
          videoDiggCount,
          videoDiggCountAmplitude,
          videoShareCount,
          videoShareCountAmplitude,
          videoCommentCount,
          videoCommentCountAmplitude,
        } = d;

        function amplitudeFormatter(value) {
          return (
            <>
              {Number(value) && Number(value) > 0 ? (
                <Text type="danger">
                  ↑{value < 1 && <>{value.toFixed(2)}</>}
                  {value >= 1 && value < 10000 && <>{value.toFixed(0)}</>}
                  {value >= 10000 && <span>10000+</span>}%
                </Text>
              ) : (
                // 小于等于 0 也显示 -
                <Text type="secondary">-</Text>
              )}
            </>
          );
        }

        return (
          <PictureInfoContainer
            onClick={onPicClick.bind(null, d)}
            key={index.toString()}
            hasPlayButton={true}
            posterUrls={[videoCoverPath] || []}
            title={goodsTitle}
            additionalContent={
              <>
                <div>作者：{authorName}</div>
                <div>发布时间：{videoCreateTime.split(' ')[0]} </div>
              </>
            }
            bottomContent={
              <div className={styles.picBottom}>
                <Space direction="vertical" size={0} align="center">
                  <Text type="secondary">点赞数</Text>
                  <b>{getFomatValue(videoDiggCount, 'shortNumber(0)')}</b>
                  <span>{amplitudeFormatter(videoDiggCountAmplitude)}</span>
                </Space>
                <Space direction="vertical" size={0} align="center">
                  <Text type="secondary">点赞数</Text>
                  <b>{getFomatValue(videoShareCount, 'shortNumber(0)')}</b>
                  <span>{amplitudeFormatter(videoShareCountAmplitude)}</span>
                </Space>
                <Space direction="vertical" size={0} align="center">
                  <Text type="secondary">点赞数</Text>
                  <b>{getFomatValue(videoCommentCount, 'shortNumber(0)')}</b>
                  <span>{amplitudeFormatter(videoCommentCountAmplitude)}</span>
                </Space>
              </div>
            }
          />
        );
      })}
    </div>
  );
});

function ShopInfoTable(props) {
  const { dataSource } = props;

  return (
    <Table
      bordered
      rowKey={record => record.goodsTitle}
      scroll={{ y: 225 }}
      dataSource={dataSource}
      size="small"
      pagination={false}
    >
      <Column title="商品标题" dataIndex="goodsTitle" key="goodsTitle" />
      <Column
        width={130}
        // 目前展示一级行业
        title="商品分类"
        dataIndex="goodsFirstIndustry"
        key="goodsFirstIndustry"
      />
      <Column
        width={100}
        title="落地页"
        dataIndex="goodsLandpageUrl"
        key="goodsLandpageUrl"
        render={value => {
          return (
            <a href={value} target="_blank" rel="noopener noreferrer">
              点击这里
            </a>
          );
        }}
      />
      <Column
        width={150}
        title="商家"
        dataIndex="shopInfo"
        key="shopInfo"
        render={showInfo => {
          return (
            <Tooltip title={<ShopInfo {...showInfo} />} placement="left">
              <Typography.Link>{showInfo.shopName}</Typography.Link>
            </Tooltip>
          );
        }}
      />
    </Table>
  );
}

export default Video;
