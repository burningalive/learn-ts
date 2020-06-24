import React from 'react';

import Advertiser from './Advertiser';

function Web() {
  // advertiserType=[4,1] 相当于App广告主类型，这个是后端定的。
  return <Advertiser advertiserType={[4, 1]} selectionSelectLabel="应用名称" />;
}
Web.displayName = 'Web';

export default Web;
