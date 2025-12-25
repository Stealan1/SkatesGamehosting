import { useState } from 'react';

const Home = () => {
  const [section, setSection] = useState('news');

  const renderSection = () => {
    switch(section) {
      case 'news': return <div><h2>News</h2><p>Latest news here.</p></div>;
      case 'current-booking': return <div><h2>Current Booking</h2><p>Your current booking details.</p></div>;
      case 'fun-stuff': return <div><h2>Other Fun Stuff</h2><p>Fun content.</p></div>;
      case 'report-bug': return <ReportBug />;
      case 'contact': return <div><h2>Contact</h2><p>Contact information.</p></div>;
      default: return <div><h2>News</h2><p>Latest news here.</p></div>;
    }
  };

  return (
    <div>
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