// @ts-nocheck
import React from 'react';
import { VariableSizeList } from 'react-window';

import RowComponent from './RowComponent';

import items from './mock.json';

const Row = ({ index, style }) => (
  <RowComponent image={items[index]} num={index} style={style} />
);

const getItemSize = () => Math.floor(Math.random() * 230) + 130;

const ListComponent = () => (
  <VariableSizeList
    height={500}
    width={500}
    itemCount={items.length}
    itemSize={getItemSize}
    className="list-container"
  >
    {Row}
  </VariableSizeList>
);

function Main() {
  return (
    <>
      <ListComponent />
      <div className="title">
        <h1>react-window</h1>
      </div>
    </>
  );
}
export default Main;
