import LoginLeftPanel from '../components/Login/LoginLeftPanel.jsx';
import LoginForm from '../components/Login/LoginForm.jsx';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      <LoginLeftPanel />
      <div className="relative flex w-full flex-1 items-center justify-center px-6 py-16 lg:w-1/2">
        <div
          className="blob left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 bg-primary/15"
          aria-hidden="true"
        />
        <LoginForm />
      </div>
    </div>
  );
}
