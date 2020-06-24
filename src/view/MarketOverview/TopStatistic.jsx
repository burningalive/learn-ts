import React from 'react';

import Statistic from '$components/Statistic';

import styles from './index.module.less';

export default function TopStatistic(props) {
  const {
    fetchAdver,
    fetchAdverDay2DayRatio,
    fetchAdverDay2SameRatio,
    fetchAd,
    fetchAdDay2DayRatio,
    fetchAdDay2SameRatio,
    weekFetchAdver,
    fetchAdverWeek2WeekRatio,
    weekFetchAd,
    fetchAdWeek2WeekRatio,
  } = props;

  return (
    <div className={styles.statistic}>
      <Statistic
        title="昨日独立广告主"
        value={fetchAdver}
        leftStatistic={{
          value: fetchAdverDay2DayRatio,
          valueStyle: {
            color: getColor(fetchAdverDay2DayRatio),
          },
          prefix: <>日环比:</>,
          suffix: '%',
          precision: 2,
        }}
        rightStatistic={{
          value: fetchAdverDay2SameRatio,
          valueStyle: {
            color: getColor(fetchAdverDay2SameRatio),
          },
          prefix: <>周同比:</>,
          suffix: '%',
          precision: 2,
        }}
      />
      <Statistic
        title="昨日独立广告"
        value={fetchAd}
        leftStatistic={{
          value: fetchAdDay2DayRatio,
          valueStyle: {
            color: getColor(fetchAdDay2DayRatio),
          },
          prefix: <>日环比: </>,
          suffix: '%',
          precision: 2,
        }}
        rightStatistic={{
          value: fetchAdDay2SameRatio,
          valueStyle: {
            color: getColor(fetchAdDay2SameRatio),
          },
          prefix: <>周同比:</>,
          suffix: '%',
          precision: 2,
        }}
      />
      <Statistic
        title="本周独立广告主"
        value={weekFetchAdver}
        leftStatistic={{
          value: fetchAdverWeek2WeekRatio,
          valueStyle: {
            color: getColor(fetchAdverWeek2WeekRatio),
          },
          prefix: <>周环比:</>,
          suffix: '%',
          precision: 2,
        }}
      />
      <Statistic
        title="本周独立广告"
        value={weekFetchAd}
        leftStatistic={{
          value: fetchAdWeek2WeekRatio,
          valueStyle: {
            color: getColor(fetchAdWeek2WeekRatio),
          },
          prefix: <>周环比:</>,
          suffix: '%',
          precision: 2,
        }}
      />
    </div>
  );
}

function getColor(value) {
  return value > 0 ? '#cf1322' : '#3f8600';
}
