import React, { useState, useMemo } from 'react';
import { AdvancedTable } from '@tencent/shared-components';
import { Select, Table, Typography } from 'antd';

function MediaIndustry(props) {
  const columns = [
    {
      title: '行业',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '广告主数',
      key: 'adverCount',
      dataIndex: 'adverCount',
      format: 'thousandSemicolon',
      sorter: true,
    },
    {
      title: '广告数',
      key: 'adCount',
      dataIndex: 'adCount',
      format: 'thousandSemicolon',
      sorter: true,
    },
    {
      title: '行业曝光预估 (万)',
      key: 'estimateExpo',
      dataIndex: 'estimateExpo',
      format: 'thousandSemicolon',
      formatter(value) {
        return (value / 10000).toFixed(0);
      },
      sorter: true,
    },
    {
      title: 'ECPM',
      key: 'ecpm',
      dataIndex: 'ecpm',
      sorter: true,
    },
    {
      title: '行业消耗预估',
      key: 'cupt',
      dataIndex: 'cupt',
      format: 'thousandSemicolon',
      sorter: true,
    },
    {
      title: '消耗占比',
      key: 'cuptRatio',
      dataIndex: 'cuptRatio',
      formatter(value) {
        return `${value}%`;
      },
      sorter: true,
      showSorterTooltip: false, // 干扰了上面 select 组件，取消 tooltip
    },
    {
      title: '曝光占比',
      key: 'estimateExpoRatio',
      dataIndex: 'estimateExpoRatio',
      formatter(value) {
        return `${value}%`;
      },
      sorter: true,
    },
  ];
  const { mediaData } = props;
  const { industryTableDataObj, industryKeys } = useMemo(() => {
    const _industryTableDataObj = mediaDataAdapter(mediaData);
    const _industryKeys = Object.keys(_industryTableDataObj);
    return {
      industryTableDataObj: _industryTableDataObj,
      industryKeys: _industryKeys,
    };
  }, [mediaData]);
  const [dataSource, setDataSource] = useState(
    // 默认第一个
    industryTableDataObj[industryKeys[0]]
  );
  const [selectedIndustryKey, setSelectedIndustryKey] = useState(
    industryKeys[0]
  );
  const onSelectChange = value => {
    setSelectedIndustryKey(value);
    setDataSource(industryTableDataObj[value]);
  };

  return (
    <AdvancedTable
      rowKey="title"
      dataSource={dataSource}
      columns={columns}
      toolBar={{ reload: false }}
      toolBarRender={() => {
        return (
          <Select
            style={{ width: 150 }}
            placeholder="请选择媒体"
            defaultValue={selectedIndustryKey}
            onChange={onSelectChange}
          >
            {industryKeys.map(v => {
              return (
                <Select.Option value={v} key={v}>
                  {v}
                </Select.Option>
              );
            })}
          </Select>
        );
      }}
      title={`${selectedIndustryKey}行业数据`}
      summary={pageData => {
        let adverCountSum = 0,
          adCountSum = 0,
          estimateExpoSum = 0,
          ecpmSum = 0,
          cuptSum = 0,
          cuptRatioSum = 0,
          estimateExpoRatioSum = 0;
        pageData.forEach(
          ({
            adverCount,
            adCount,
            estimateExpo,
            ecpm,
            cupt,
            cuptRatio,
            estimateExpoRatio,
          }) => {
            adverCountSum += Number(adverCount);
            adCountSum += Number(adCount);
            estimateExpoSum += Number(estimateExpo);
            ecpmSum += Number(ecpm);
            cuptSum += Number(cupt);
            cuptRatioSum += Number(cuptRatio);
            estimateExpoRatioSum += Number(estimateExpoRatio);
          }
        );

        if (cuptRatioSum >= 100) {
          cuptRatioSum = 100;
        }
        if (estimateExpoRatioSum >= 100) {
          estimateExpoRatioSum = 100;
        }

        return (
          <>
            <Table.Summary.Row>
              <Table.Summary.Cell>
                <Typography.Text type="danger">总计</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Typography.Text type="danger">
                  {adverCountSum.toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Typography.Text type="danger">
                  {adCountSum.toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Typography.Text type="danger">
                  {Number(
                    (estimateExpoSum / 10000).toFixed(0)
                  ).toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Typography.Text type="danger">
                  {ecpmSum.toFixed(2)}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Typography.Text type="danger">
                  {cuptSum.toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Typography.Text type="danger">{`${cuptRatioSum.toFixed(
                  0
                )}%`}</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Typography.Text type="danger">
                  {`${estimateExpoRatioSum.toFixed(0)}%`}
                </Typography.Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </>
        );
      }}
    />
  );
}
MediaIndustry.displayName = 'MediaIndustry';

function mediaDataAdapter(mediaData) {
  const industryTableDataObj = [];

  mediaData.forEach(d => {
    const { title, industry } = d;
    industryTableDataObj[title] = industry;
  });
  return industryTableDataObj;
}

export default MediaIndustry;
