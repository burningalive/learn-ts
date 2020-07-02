import React from 'react';

const RowComponent = ({ image, num, style }) => (
  <div style={style} className={num % 2 ? "list-group-item-odd" : "list-group-item-even"}>
    <div className="avatar">
      <img alt="avatar" src={image} />
    </div>
    
    <div className="details">
      <div className="info">
        <p className="number">#{num + 1}</p>
      </div>

    </div>
  </div>
);

export default RowComponent;