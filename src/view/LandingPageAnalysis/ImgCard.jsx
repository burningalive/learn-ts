/**
 * 落地页正文中的图文块组件
 */
import React, { memo } from 'react';
import getChannelUrl from '$utils/getChannelUrl.js';
import style from './index.module.less';
import noImage from '$assets/img/no-image.svg';

function ImgCard(props) {
  const {
    data: { advertiserName, advertiserIcon, url, snapshot, serviceChannel },
  } = props;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <div className={style.cardOuter}>
        <div className={style.snapshotOuter}>
          <img
            loading="lazy"
            src={snapshot}
            alt=""
            className={style.snapshotImg}
          />
        </div>
        <div className={style.cardFooterBox}>
          <div className={style.advertiserBox}>
            <img
              loading="lazy"
              src={advertiserIcon || noImage}
              alt=""
              className={style.advertiserIcon}
            />
            <span className={style.advertiserName}>{advertiserName}</span>
          </div>

          {serviceChannel ? (
            <img
              loading="lazy"
              src={getChannelUrl(serviceChannel)}
              alt=""
              className={style.serviceChannelImg}
            />
          ) : null}
        </div>
      </div>
    </a>
  );
}

export default memo(ImgCard);
