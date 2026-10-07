import { useStore } from '../../state/AppState';
import { isValidEmail } from '../../utils';
import { OnboardingLayout } from './OnboardingLayout';

export function Auth() {
  const { state, update } = useStore();
  const { authMode, name, email, password, confirmPassword } = state;
  const isSignup = authMode === 'signup';

  const emailInvalid = email.length > 0 && !isValidEmail(email);
  const confirmMismatch = isSignup && confirmPassword.length > 0 && confirmPassword !== password;

  const submit = () => {
    const displayName = name || (email ? email.split('@')[0] : 'Friend');
    update({ name: displayName, screen: 'location' });
  };

  return (
    <OnboardingLayout
      step="auth"
      centered
      footer={
        <button className="btn-primary" onClick={submit}>
          Continue
        </button>
      }
    >
      <h2 className="step-title">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
      <p className="section-note step-note">
        {isSignup ? 'Join a community growing in God together.' : 'Log in to continue your journey.'}
      </p>

      {isSignup && (
        <>
          <label className="field-label">Name</label>
          <input
            className="field-input gap-lg"
            placeholder="Michael"
            value={name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </>
      )}

      <label className="field-label">Email</label>
      <input
        className={`field-input ${emailInvalid ? 'invalid gap-xs' : 'gap-md'}`}
        placeholder="michael@example.com"
        value={email}
        onChange={(e) => update({ email: e.target.value })}
      />
      {emailInvalid && <p className="field-error">Enter a valid email, like michael@example.com</p>}

      <label className={`field-label ${emailInvalid ? 'after-error' : ''}`}>Password</label>
      <input
        type="password"
        className={`field-input ${isSignup ? 'gap-lg' : ''}`}
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => update({ password: e.target.value })}
      />

      {isSignup && (
        <>
          <label className="field-label">Confirm Password</label>
          <input
            type="password"
            className={`field-input ${confirmMismatch ? 'invalid' : ''}`}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => update({ confirmPassword: e.target.value })}
          />
        </>
      )}
      {confirmMismatch && <p className="field-error">Passwords don't match</p>}

      <div className="skip-row">
        <button
          className="btn-link"
          onClick={() => update({ authMode: isSignup ? 'login' : 'signup', confirmPassword: '' })}
        >
          {isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}
        </button>
      </div>
    </OnboardingLayout>
  );
}
