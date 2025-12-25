import './Topbar.css';

const Topbar = () => {
  return (
    <header className="sg-topbar">
      <div className="sg-top-left">
        <div className="sg-breadcrumb">Home / Dashboard</div>
      </div>
      <div className="sg-top-right">
        <div className="sg-search"><input placeholder="Search servers, bookings..."/></div>
        <div className="sg-user">STEALAN</div>
      </div>
    </header>
  );
};

export default Topbar;
