import React, { useState, useEffect } from 'react';
import { AdvancedTable } from '@tencent/shared-components';

import axios from '$utils/axios';
import { downloadOffline } from '$src/service/download';
import { Card } from 'antd';

function OfflineDownLoadList() {
  const [taskList, setData] = useState([]);
  useEffect(() => {
    async function fetchData() {
      await axios.post('file/download/GetStatusList', {}).then(response => {
        const {
          data: {
            data: { taskList },
          },
        } = response;
        return setData(taskList);
      });
    }
    fetchData();
  }, []);

  const columns = [
    {
      title: '文件名',
      width: 100,
      dataIndex: 'fileName',
      key: 'fileName',
      fixed: 'left',
    },
    {
      title: '任务状态',
      width: 100,
      dataIndex: 'status',
      key: 'status',
      fixed: 'left',
      render: status => {
        const statusText = ['执行中', '已完成'];
        return statusText[status] || '-';
      },
    },
    {
      title: '任务提交时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 150,
      render: (taskId, record) => {
        return (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a
            disabled={!record.status}
            onClick={() => {
              downloadOffline({
                // eslint-disable-next-line camelcase
                task_id: taskId,
                // eslint-disable-next-line camelcase
                file_name: record.fileName,
              });
            }}
          >
            下载
          </a>
        );
      },
    },
  ];

  return (
    <Card bordered={false}>
      <AdvancedTable
        toolBar={{
          reload: false,
        }}
        rowKey="taskId"
        title="离线任务列表"
        dataSource={taskList}
        columns={columns}
      />
    </Card>
  );
}
OfflineDownLoadList.displayName = 'OfflineDownLoadList';

export default OfflineDownLoadList;
