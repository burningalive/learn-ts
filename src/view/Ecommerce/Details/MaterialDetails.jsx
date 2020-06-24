import React from 'react';
import {
  PictureInfoContainer,
  openConfirmModal,
} from '@tencent/shared-components';
import { Space, Typography, Tooltip } from 'antd';
import getFomatValue from '@tencent/shared-utils/lib/format/getFomatValue';

import ImgVideoDetail from '$components/ImgVideoDetail';
import getChannelUrl from '$utils/getChannelUrl';

import QueryMaterialContainer from './QueryDetailContainer';

import styles from './Details.module.less';

function MaterialDetails(props) {
  return (
    <QueryMaterialContainer {...props} url="merchant/detail">
      <Content />
    </QueryMaterialContainer>
  );
}
MaterialDetails.displayName = 'MaterialDetails';

function Content(props) {
  const { result } = props;

  function onPicClick(record) {
    const {
      materialVideo: video,
      advertiserName,
      advertiserIcon,
      goodsAdvertiserType: advertiserType,
      goodsAdvertiserCat: advertiserCat,
      materialAdvFormat: advFormat,
      materialFirstFetchTime: firstFetchTime,
      materialNewFetchTime: newFetchTime,
      materialDeliveryFetchDuration: deliveryFetchDuration,
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

  return (
    <div className={styles.advertisingMaterialContent}>
      {result.map(d => {
        const {
          goodsMaterialId: materialId,
          name,
          advertiserOs,
          materialAdvFormat: advFormat,
          materialFirstFetchTime: firstFetchTime,
          exposureNum,
          estimateExposure,
          materialDeliveryFetchDuration: deliveryFetchDuration,
          materialVideo: video,
          materialImg: img,
          cate,
          materialServiceChannel: serviceChannel,
        } = d;
        const channelIcon = getChannelUrl(serviceChannel);
        return (
          <PictureInfoContainer
            onClick={onPicClick.bind(null, d)}
            key={materialId}
            hasPlayButton={!!video}
            posterUrls={img || []}
            title={name}
            additionalContent={
              <>
                <div>
                  {advertiserOs} | {cate} | {advFormat}
                </div>
                <div>{firstFetchTime} 首次采集</div>
                <img src={channelIcon} width={14} height={14} alt="" />
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
}

export default MaterialDetails;
