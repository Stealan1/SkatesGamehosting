import './Home.css';
import { useState } from 'react';

const Home = () => {
  const [servers] = useState([
    { name: 'Inferno-01', status: 'ONLINE', players: 24 },
    { name: 'Abyss-02', status: 'MAINT', players: 0 },
    { name: 'Oblivion-09', status: 'ONLINE', players: 8 }
  ]);

  return (
    <main className="sg-main">
      <section className="sg-hero">
        <div className="sg-hero-left">
          <h1>Skates Game Hosting</h1>
          <p className="sg-sub">Dark. Fast. Merciless. Your servers, sharpened for war.</p>
          <div className="sg-cta-row">
            <button className="sg-cta primary">Get a Server</button>
            <button className="sg-cta ghost">Explore</button>
          </div>
        </div>
        <div className="sg-hero-right">
          <div className="sg-stat-card">
            <div className="label">Active Servers</div>
            <div className="value">{servers.length}</div>
          </div>
          <div className="sg-stat-card dark">
            <div className="label">Players Online</div>
            <div className="value">{servers.reduce((a,s)=>a+s.players,0)}</div>
          </div>
        </div>
      </section>

      <section className="sg-grid">
        <div className="sg-panel">
          <h3>Servers</h3>
          <ul className="sg-servers">
            {servers.map(s=> (
              <li key={s.name} className={`sg-server-item ${s.status==='ONLINE'?'online':'maintenance'}`}>
                <div className="name">{s.name}</div>
                <div className="meta">{s.players} players • {s.status}</div>
                <div className="controls"><button className="tiny">Manage</button></div>
              </li>
            ))}
          </ul>
        </div>

        <div className="sg-panel">
          <h3>Latest News</h3>
          <article className="sg-news">
            <h4>New region launched</h4>
            <p>Our newest node has low-latency routing and better DDoS protection.</p>
          </article>
          <article className="sg-news">
            <h4>Maintenance schedule</h4>
            <p>Planned maintenance on the 1st of next month. Expect brief interruptions.</p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default Home;