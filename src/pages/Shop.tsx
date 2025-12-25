import { useState, useEffect } from 'react';
import { getPacks, buyPack } from '../api';
import './Shop.css';

const Shop = () => {
  const [packs, setPacks] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    getPacks().then(setPacks).catch(()=>setPacks([]));
  }, []);

  const addToCart = (pack:any)=> setCart(s=>[...s,pack]);
  const checkout = async ()=>{
    for(const p of cart){
      await buyPack(p.id);
    }
    alert('Thank you for your purchases');
    setCart([]);
  }

  return (
    <main className="sg-main">
      <h1>Shop</h1>
      <div className="sg-shop-grid">
        {packs.map(pack=> (
          <div className="sg-pack" key={pack.id}>
            <h4>{pack.name}</h4>
            <p>{pack.description}</p>
            <div className="price">{pack.price} FG</div>
            <div style={{marginTop:10}}>
              <button onClick={()=>addToCart(pack)} className="primary">Add to cart</button>
            </div>
          </div>
        ))}
      </div>

      {cart.length>0 && (
        <div className="sg-cart">
          <div><strong>Cart</strong> ({cart.length})</div>
          <ul>
            {cart.map((c,i)=> <li key={i}>{c.name} — {c.price} FG</li>)}
          </ul>
          <div style={{marginTop:8}}>
            <button className="primary" onClick={checkout}>Checkout</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Shop;