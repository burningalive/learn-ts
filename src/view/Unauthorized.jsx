import React from 'react';
import { Result } from 'antd';

/**
 * @param {Number} props.sysId 敏感权限系统的接入系统 id
 * @param {Number} props.operationId 敏感权限系统的操作id
 */
function Unauthorized(props) {
  const { operationId, sysId } = props;
  document.title = '403 未授权';

  return (
    <Result
      status="403"
      title="403 未授权"
      subTitle="您没有权限访问当前页面"
      extra={
        <a
          alt=""
          href={`http://sec.cm.com/RightApplyPersonal/?sys_id=${sysId}&operation_id=${operationId}`}
          target="__blank"
        >
          我要申请
        </a>
      }
    />
  );
}

Unauthorized.displayName = 'Unauthorized ';

export default Unauthorized;
