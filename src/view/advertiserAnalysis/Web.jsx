import React from 'react';

import Advertiser from './Advertiser';

function Web() {
  // advertiserType=[2] 相当于Web广告主类型，这个是后端定的。
  return <Advertiser advertiserType={[2]} selectionSelectLabel="广告主名称" />;
}
Web.displayName = 'Web';

export default Web;
