import React, { memo } from 'react';
import {
  PictureInfoContainer,
  openConfirmModal,
} from '@tencent/shared-components';
import { Space, Typography, Tooltip } from 'antd';
import getFomatValue from '@tencent/shared-utils/lib/format/getFomatValue';

import ImgVideoDetail from '$components/ImgVideoDetail';
import ImgTitleCard from '$components/ImgTitleCard';

import QueryAdvertisingData from './QueryAdvertisingData';

import styles from './Details.module.less';

function AdvertisingMaterialDetails(props) {
  return (
    <QueryAdvertisingData {...props} url="testAdvertiser/testMaterial2">
      <Content />
    </QueryAdvertisingData>
  );
}
AdvertisingMaterialDetails.displayName = 'AdvertisingMaterialDetails';

/**
 * 这里使用 memo 做了浅层 props 对比，每次查询，这里只会渲染一次，深层的对比目前不是很必要。
 * 比较 dataSource 的数据是后端返回的，有时候渲染一次的速度并不会比对比慢多少，而且后端的数据还可能变化。
 */
const Content = memo(props => {
  const { result } = props;

  return (
    <div className={styles.advertisingMaterialContent}>
      {result.map(d => {
        const {
          materialId,
          advertiserName,
          advertiserOs,
          advertiserCat,
          advFormat,
          firstFetchTime,
          exposureNum,
          estimateExposure,
          deliveryFetchDuration,
          video,
          serviceChannel,
          img,
        } = d;
        return (
          <PictureInfoContainer
            onClick={onPicClick.bind(null, d)}
            key={materialId}
            hasPlayButton={!!video}
            posterUrls={img || []}
            title={
              <ImgTitleCard title={advertiserName} channels={serviceChannel} />
            }
            showTitleTooltip={false}
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
        mainLabelList={[{ value: `${advertiserType} | ${advertiserCat}` }]}
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

export default AdvertisingMaterialDetails;
