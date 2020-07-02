// @ts-nocheck
import React from 'react';
import {  FixedSizeList } from 'react-window';
import { List, Typography } from 'antd';
import ItemCard from './ItemCard';
import { useChecked } from './use-checked';
import './index.css';

export interface CartItem {
  id: number;
  name: string;
  price: number;
}

// const cartData = Array(200)
//   .fill(undefined)
//   .map((v, i) => ({
//     id: i,
//     name: `商品${i}`,
//     price: Math.round(Math.random() * 100),
//   }));

export default function Cart() {
  const [cartData, setCartData] = React.useState(
    Array(200)
      .fill(undefined)
      .map((v, i) => ({
        id: i,
        name: `商品${i + 1}`,
        price: Math.round(Math.random() * 100),
      }))
  );

  const {
    checkedAll,
    checkedMap,
    onCheckedAllChange,
    onCheckedChange,
    filterChecked,
  } = useChecked(cartData);

  // cartItems的积分总和
  const sumPrice = (cartItems: CartItem[]) => {
    return cartItems.reduce((sum, cur) => sum + cur.price, 0);
  };

  const onWrapCheckedAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checkAll = e.target.checked;
    onCheckedAllChange(checkAll);
  };

  const total = sumPrice(filterChecked());

  const footer = (
    <div className="footer">
      <div className="check-all">
        <input
          checked={checkedAll}
          onChange={onWrapCheckedAllChange}
          type="checkbox"
        />
        全选
      </div>
      <button
        onClick={() => {
          setCartData(cartData => {
            cartData.splice(cartData.length - 1, 1);
            return [...cartData];
          });
        }}
      >
        删除最后一项
      </button>
      <div>
        价格总计 <Typography.Text>${total}</Typography.Text>
      </div>
    </div>
  );

  const Row = ({
    index,
    style,
  }) => {
    const item = cartData[index];
    const checked = checkedMap[item.id] || false;
    return (
      <ItemCard
        item={item}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    );
  };
  // @ts-ignore
  return (
    <div className="cart">
      <div>购物车</div>
      
      <FixedSizeList
        height={800}
        itemCount={cartData.length}
        itemSize={50}
        className="cartList"
        width={400}
      >
        {Row}
      </FixedSizeList>
      {footer}
    </div>
  );
  /* <List
        header={<div>购物车</div>}
        footer={footer}
        bordered
        dataSource={cartData}
        renderItem={item => {
          const checked = checkedMap[item.id] || false;
          return (
            <ItemCard
              item={item}
              checked={checked}
              onCheckedChange={onCheckedChange}
            />
          );
        }}
      /> */
}


function InnerView(props: any) {
  // console.log('inner view re render');
  return <p onClick={props.handleClick}>{props.count}</p>;
}
