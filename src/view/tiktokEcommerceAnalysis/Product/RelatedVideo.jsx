import React, { memo } from 'react';
import {
  QueryContainer,
  FormItem,
  DatePicker,
  PictureInfoContainer,
  openConfirmModal,
} from '@tencent/shared-components';
import { Select, Radio, Space, Typography } from 'antd';
import { useRouteMatch } from 'react-router-dom';
import moment from 'moment';
import getFomatValue from '@tencent/shared-utils/lib/format/getFomatValue';

import ImgVideoDetail from '$components/ImgVideoDetail';
import useTakeGoods from '$src/hooks/useTakeGoods';
import axios from '$utils/axios';

import styles from './Details.module.less';

const Text = Typography.Text;

function RelatedVideo() {
  const {
    form,
    onSubmit,
    onMount,
    onValuesChange,
    date,
    dateType,
    startDate,
    endDate,
  } = useTakeGoods();
  const {
    params: { goodsId },
  } = useRouteMatch();

  function outerRequest(
    formValues,
    pagination,
    sorter = {
      field: 'video_digg_count',
      order: 'descend',
    }
  ) {
    const params = {
      searchContent: {
        startDate,
        endDate,
        dateType,
        goodsId,
      },
      pagination: {
        pageSize: pagination.pageSize,
        current: pagination.current,
      },
      sort: {
        field: sorter.field,
        desc: sorter.order === 'descend',
      },
    };

    return axios
      .post(`tiktokECommerce/goodsRelatedVideo/${dateType}`, params)
      .then(
        ({
          data: {
            data: { goodsRelatedVideoList, pagination },
          },
        }) => {
          return {
            dataSource: goodsRelatedVideoList,
            pagination: { total: pagination.total },
          };
        }
      );
  }

  return (
    <QueryContainer
      request={outerRequest}
      onMount={onMount}
      onSubmit={onSubmit}
    >
      <QueryContainer.QueryForm onValuesChange={onValuesChange} form={form}>
        <FormItem name="dateType" label="榜单" required initialValue={dateType}>
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="day">日</Radio.Button>
            <Radio.Button value="week">周</Radio.Button>
            <Radio.Button value="month">月</Radio.Button>
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
      </QueryContainer.QueryForm>
      <QueryContainer.Content
        type="inner"
        bordered={true}
        title="查询结果"
        extra={
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
            <Select.Option value="video_digg_count">按点赞数升序</Select.Option>
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
RelatedVideo.displayName = 'RelatedVideo';

/**
 * memo 可以避免多次渲染，每次查询这两只会渲染一次。
 */
const Content = memo(props => {
  const {
    result: { dataSource },
  } = props;

  function onPicClick(record) {
    const {
      authorName,
      authorAvatarPath,
      videoPlayPath,
      goodsFirstIndustry,
      goodsSecondIndustry,
      videoDiggCount,
      videoShareCount,
      videoCommentCount,
      videoTitle,
      videoCreateTime,
      musicTitle,
      goodsSource,
      goodsLandpageUrls,
    } = record;
    const isVideo = true;

    openConfirmModal({
      closable: true,
      width: 900,
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
          tagList={[goodsFirstIndustry, goodsSecondIndustry]}
          descriptionList={[videoTitle]}
          otherLabelList={[
            {
              label: '视频发布时间',
              value: videoCreateTime,
            },
            {
              label: '视频音乐',
              value: musicTitle,
            },
            {
              label: '商品来源',
              value: goodsSource,
            },
            {
              label: '落地页',
              value: (
                <>
                  {goodsLandpageUrls.map((l, index) => {
                    return (
                      <a
                        key={index.toString()}
                        href={l}
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
            posterUrls={[videoCoverPath] || []}
            title={goodsTitle}
            hasPlayButton={true}
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

export default memo(RelatedVideo);
