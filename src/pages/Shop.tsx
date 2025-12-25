import { useState, useEffect } from 'react';

const Shop = () => {
  const [packs, setPacks] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/shop/packs`)
      .then(res => res.json())
      .then(setPacks);
  }, []);

  const buy = async (packId: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shop/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId })
    });
    if (res.ok) alert('Purchase successful');
  };

  return (
    <div>
      <h1>Shop</h1>
      {packs.map((pack: any) => (
        <div key={pack.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
          <h3>{pack.name}</h3>
          <p>{pack.description}</p>
          <p>Price: {pack.price}</p>
          <button onClick={() => buy(pack.id)}>Buy</button>
        </div>
      ))}
    </div>
  );
};

export default Shop;