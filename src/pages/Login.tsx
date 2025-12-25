const Login = () => {
  const login = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/discord`;
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={login}>Login with Discord</button>
    </div>
  );
};

export default Login;