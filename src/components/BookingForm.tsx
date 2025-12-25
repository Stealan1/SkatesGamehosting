import { useEffect, useState } from 'react';
import { getServices, getPriceEstimate, submitBooking } from '../api';
import './BookingForm.css';

const REALMS = ['EU','NA','KR'];
const DURATIONS = [1,2,3,4,6,8,12];

export default function BookingForm(){
  const [services, setServices] = useState<string[]>([]);
  const [service, setService] = useState('ENCH');
  const [realm, setRealm] = useState('EU');
  const [start, setStart] = useState('');
  const [duration, setDuration] = useState(1);
  const [game, setGame] = useState('');
  const [pass, setPass] = useState('');
  const [price, setPrice] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ getServices().then(setServices); },[]);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
        const p = await getPriceEstimate(duration);
        if(mounted) setPrice(p?.price ?? null);
      }catch(e){ setPrice(null); }
    })();
    return ()=>{ mounted = false };
  },[duration]);

  const submit = async (e:any)=>{
    e.preventDefault();
    setLoading(true);
    const payload = { service, realm, start, duration, game, pass };
    try{
      const res = await submitBooking(payload);
      if(res.ok){ alert('Booking submitted!'); } else { alert('Booking failed'); }
    }catch(e){ alert('Network error'); }
    setLoading(false);
  }

  return (
    <form className="sg-booking" onSubmit={submit}>
      <h2>Book a Server</h2>
      <div className="row">
        <label>Service</label>
        <select value={service} onChange={e=>setService(e.target.value)}>
          {services.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="row two">
        <div>
          <label>Realm</label>
          <select value={realm} onChange={e=>setRealm(e.target.value)}>
            {REALMS.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label>Duration (hours)</label>
          <select value={duration} onChange={e=>setDuration(Number(e.target.value))}>
            {DURATIONS.map(d=> <option key={d} value={d}>{d}h</option>)}
          </select>
        </div>
      </div>

      <div className="row">
        <label>Start time</label>
        <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} />
      </div>

      <div className="row two">
        <div>
          <label>Game</label>
          <input value={game} onChange={e=>setGame(e.target.value)} placeholder="MyServer" />
        </div>
        <div>
          <label>Password</label>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="abcd" />
        </div>
      </div>

      <div className="row summary">
        <div>Estimated price: {price!=null? `${price} FG` : '—'}</div>
        <button className="primary" disabled={loading}>Book now</button>
      </div>
    </form>
  );
}
