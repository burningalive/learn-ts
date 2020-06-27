import React from "react"
import { CartItem } from "./"
import { OnCheckedChange } from './use-checked'
import { Typography } from "antd"

interface Props {
  item: CartItem
  checked: boolean
  onCheckedChange: OnCheckedChange<CartItem>
}

// memo优化策略
function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.checked === nextProps.checked
  )
}

const ItemCard = (props: Props) => {
  console.log('cart item rerender')
  const { item, checked, onCheckedChange } = props
  const { name, price } = item

  const checkBox = React.useRef<HTMLInputElement>(null);

  // const onWrapCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { checked } = e.target
  // }
  
  
  return (
    <div className="item-card" onClick={()=>{
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
      <p className="item-info">
        {name} <Typography.Text >${price}</Typography.Text>
      </p>
    </div>
  )
}


export default React.memo(ItemCard)