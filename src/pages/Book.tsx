import { useState } from 'react';
import type { ChangeEvent } from 'react';

const Book = () => {
  const [form, setForm] = useState({ service: '', realm: '', start: '', duration: '', game: '', pass: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) alert('Booked successfully');
  };

  return (
    <div>
      <h1>Book</h1>
      <form onSubmit={e => { e.preventDefault(); submit(); }}>
        <div>
          <label>Service:</label>
          <input name="service" value={form.service} onChange={handleChange} />
        </div>
        <div>
          <label>Realm:</label>
          <input name="realm" value={form.realm} onChange={handleChange} />
        </div>
        <div>
          <label>Start:</label>
          <input name="start" type="datetime-local" value={form.start} onChange={handleChange} />
        </div>
        <div>
          <label>Duration:</label>
          <input name="duration" value={form.duration} onChange={handleChange} />
        </div>
        <div>
          <label>Game:</label>
          <input name="game" value={form.game} onChange={handleChange} />
        </div>
        <div>
          <label>Pass:</label>
          <input name="pass" value={form.pass} onChange={handleChange} />
        </div>
        <button type="submit">Book</button>
      </form>
    </div>
  );
};

export default Book;