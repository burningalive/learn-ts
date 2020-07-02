import React from "react"
import { CartItem } from "."
import { OnCheckedChange } from './use-checked'
import { Typography } from "antd"
import {Random} from 'mockjs';

interface Props {
  item: CartItem
  checked: boolean
  onCheckedChange: OnCheckedChange<CartItem>
}

const ItemCard = (props: Props) => {
  const { item, checked, onCheckedChange } = props
  const { name, price } = item

  const checkBox = React.useRef<HTMLInputElement>(null);

  // const onWrapCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { checked } = e.target
  // }
  
  
  return (
    <div className={`item-card ${checked?'checked':''}`} onClick={()=>{
      if (checkBox && checkBox.current) {
        const { checked } = checkBox.current;
        onCheckedChange(item, !checked)
      }
    }}>
      <div className="checkbox-wrap">
        <input
          ref={checkBox}
          type="checkbox"
          checked={checked}
          // onChange={onWrapCheckedChange}
        />
      </div>
      {/* <img src={Random.dataImage()} className="random-img" alt="" /> */}
      <p className="item-info">
        {name} <Typography.Text >${price}</Typography.Text>
      </p>
    </div>
  )
}


export default ItemCard;

// memo 第二个可选参数
function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.checked === nextProps.checked
  )
}
// export default React.memo(ItemCard, areEqual);