import { useState, useEffect } from 'react';

const Account = () => {
  const [me, setMe] = useState<any>({});
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/me`)
      .then(res => res.json())
      .then(setMe);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings`)
      .then(res => res.json())
      .then(setBookings);
  }, []);

  const cancel = async (id: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      setBookings(bookings.filter((b: any) => b.id !== id));
      alert('Booking cancelled');
    }
  };

  return (
    <div>
      <h1>My Account</h1>
      <div>
        <h2>Profile</h2>
        <pre>{JSON.stringify(me, null, 2)}</pre>
      </div>
      <div>
        <h2>Bookings</h2>
        {bookings.map((b: any) => (
          <div key={b.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
            <pre>{JSON.stringify(b, null, 2)}</pre>
            <button onClick={() => cancel(b.id)}>Cancel</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Account;