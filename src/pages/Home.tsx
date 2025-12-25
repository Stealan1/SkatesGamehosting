import { useState } from 'react';

const Home = () => {
  const [section, setSection] = useState('news');

  const renderSection = () => {
    switch(section) {
      case 'news': return <div><h2>News</h2><p>Welcome to Skates Game Hosting! Check out the latest updates and announcements.</p></div>;
      case 'current-booking': return <div><h2>Current Booking</h2><p>You have no active bookings at the moment.</p></div>;
      case 'fun-stuff': return <div><h2>Other Fun Stuff</h2><p>Enjoy some fun content and community features.</p></div>;
      case 'report-bug': return <ReportBug />;
      case 'contact': return <div><h2>Contact</h2><p>Get in touch with us for support.</p></div>;
      default: return <div><h2>News</h2><p>Welcome to Skates Game Hosting! Check out the latest updates and announcements.</p></div>;
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h1>Home Dashboard</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setSection('news')}>News</button>
        <button onClick={() => setSection('current-booking')}>Current Booking</button>
        <button onClick={() => setSection('fun-stuff')}>Other fun stuff</button>
        <button onClick={() => setSection('report-bug')}>Report a Bug</button>
        <button onClick={() => setSection('contact')}>Contact</button>
      </div>
      {renderSection()}
    </div>
  );
};

const ReportBug = () => {
  const [bug, setBug] = useState('');

  const submit = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bug`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bug })
    });
    if (res.ok) alert('Bug reported');
  };

  return (
    <div>
      <h2>Report a Bug</h2>
      <textarea value={bug} onChange={e => setBug(e.target.value)} placeholder="Describe the bug" />
      <button onClick={submit}>Submit</button>
    </div>
  );
};

export default Home;