import React from 'react';
import { List, Typography } from 'antd';
import ItemCard from './ItemCard';
import { useChecked } from './use-checked';
import './index.css';

export interface CartItem {
  id: number;
  name: string;
  price: number;
}

const cartData = Array(5)
  .fill(undefined)
  .map((v, i) => ({
    id: i,
    name: `商品${i}`,
    price: Math.round(Math.random() * 100),
  }));

export default function Cart() {
  const {
    checkedAll,
    checkedMap,
    onCheckedAllChange,
    onCheckedChange,
    filterChecked,
  } = useChecked(cartData);

  const [countA, setCountA] = React.useState<number>(0);
  const [countB, setCountB] = React.useState<number>(0);

  // cartItems的积分总和
  const sumPrice = (cartItems: CartItem[]) => {
    return cartItems.reduce((sum, cur) => sum + cur.price, 0);
  };

  const onWrapCheckedAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checkAll = e.target.checked;
    onCheckedAllChange(checkAll);
  };

  const total = sumPrice(filterChecked());

  const Footer = (
    <div className='footer'>
      <div className='check-all'>
        <input
          checked={checkedAll}
          onChange={onWrapCheckedAllChange}
          type='checkbox'
        />
        全选
      </div>
      <div>
        价格总计 <Typography.Text>${total}</Typography.Text>
      </div>
    </div>
  );

  function onContainerAItemClick(val: number) {
    setCountA(val);
  }

  const onContainerBItemClick = React.useCallback((val: number) => {
    setCountB(val);
  }, []);

  console.log('父组件重渲染');

  const memoed = React.useMemo(() => {
    return 1;
  }, undefined);

  return (
    <div className='cart'>
      <List
        header={<div>购物车</div>}
        footer={Footer}
        bordered
        dataSource={cartData}
        renderItem={(item) => {
          const checked = checkedMap[item.id] || false;
          return (
            <List.Item>
              <ItemCard
                item={item}
                checked={checked}
                onCheckedChange={onCheckedChange}
              />
            </List.Item>
          );
        }}
      />
      {/* <Container
        name={'A'}
        count={countA}
        onClick={onContainerAItemClick}
        // memoed={memoed}
      /> */}
      <Container
        name={'B'}
        count={countB}
        onClick={onContainerBItemClick}
        memoed={memoed}
      />
      <button
        onClick={() => {
          setCountA((val) => val + 1);
        }}
      >
        change count
      </button>
    </div>
  );
}

const Container = React.memo(
  (props: {
    onClick: any;
    count: number;
    name: string | number;
    memoed?: any;
  }) => {
    console.log(`container ${props.name} re-render`);

    return (
      <div className='container'>
        <button
          onClick={() => {
            props.onClick(props.count + 1);
          }}
        >
          increase
        </button>
        <button
          onClick={() => {
            props.onClick(props.count);
          }}
        >
          equal
        </button>
        <p>{props.count}</p>
        <InnerView count={props.count} handleClick={() => {}} />
      </div>
    );
  }
);

function InnerView(props: any) {
  // console.log('inner view re render');
  return <p onClick={props.handleClick}>{props.count}</p>;
}
