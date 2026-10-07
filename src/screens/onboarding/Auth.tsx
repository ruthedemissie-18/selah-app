import { useState } from 'react';
import { AUTH_MESSAGES, emailExists, logIn, signUp, type AuthError } from '../../services/auth';
import { useStore } from '../../state/AppState';
import { MIN_PASSWORD, normalizeEmail, validateConfirm, validateEmail, validateName, validatePassword } from '../../validation';
import { OnboardingLayout } from './OnboardingLayout';

type Field = 'name' | 'email' | 'password' | 'confirm';

export function Auth() {
  const { state, update, signIn } = useStore();
  const isSignup = state.authMode === 'signup';
  // Passwords stay in this screen only; they're never put in app state or saved.
  const [name, setName] = useState(state.name);
  const [email, setEmail] = useState(state.email);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState<Set<Field>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const errors: Partial<Record<Field, string | null>> = isSignup
    ? {
        name: validateName(name),
        email: validateEmail(email) ?? (emailExists(email) ? AUTH_MESSAGES.exists : null),
        password: validatePassword(password),
        confirm: validateConfirm(password, confirm),
      }
    : {
        email: normalizeEmail(email) ? null : 'Enter your email',
        password: password ? null : 'Enter your password',
      };
  if (!isSignup && authError === 'unknown') errors.email = AUTH_MESSAGES.unknown;
  if (!isSignup && authError === 'wrong') errors.password = AUTH_MESSAGES.wrong;

  const valid = Object.values(errors).every((e) => !e);
  // Each error shows once the user leaves the field, after a failed submit, or (confirm) while typing.
  const shown = (f: Field) =>
    (touched.has(f) || submitted || (f === 'confirm' && confirm.length > 0) || (f !== 'name' && authError)) && errors[f];
  const leave = (f: Field) => setTouched((t) => new Set(t).add(f));

  const submit = async () => {
    setSubmitted(true);
    if (!valid || busy) return;
    setBusy(true);
    try {
      if (isSignup) {
        const res = await signUp(email, password);
        if ('error' in res) return setAuthError(res.error);
        signIn(res.account.id);
        update({ name: name.trim(), email: res.account.email, screen: 'location' });
      } else {
        const res = await logIn(email, password);
        if ('error' in res) return setAuthError(res.error);
        signIn(res.account.id);
      }
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    update({ authMode: isSignup ? 'login' : 'signup' });
    setPassword('');
    setConfirm('');
    setTouched(new Set());
    setSubmitted(false);
    setAuthError(null);
  };

  const errorText = (f: Field) => {
    const e = shown(f);
    return e ? (
      <p id={`auth-${f}-error`} className="field-error">
        {e}
      </p>
    ) : null;
  };
  const inputProps = (f: Field) => ({
    id: `auth-${f}`,
    className: `field-input ${shown(f) ? 'invalid' : ''}`,
    'aria-invalid': !!shown(f),
    'aria-describedby': shown(f) ? `auth-${f}-error` : f === 'password' && isSignup ? 'auth-password-hint' : undefined,
    onBlur: () => leave(f),
  });

  return (
    <OnboardingLayout
      step="auth"
      centered
      footer={
        <button className="btn-primary" onClick={submit} disabled={!valid || busy}>
          {busy ? (isSignup ? 'Creating account…' : 'Logging in…') : 'Continue'}
        </button>
      }
    >
      <h2 className="step-title">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
      <p className="section-note step-note">
        {isSignup ? 'Join a community growing in God together.' : 'Log in to continue your journey.'}
      </p>

      <div className="auth-fields">
        {isSignup && (
          <div className="auth-field">
            <label className="field-label" htmlFor="auth-name">
              Name
            </label>
            <input
              {...inputProps('name')}
              autoComplete="name"
              placeholder="Michael"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errorText('name')}
          </div>
        )}

        <div className="auth-field">
          <label className="field-label" htmlFor="auth-email">
            Email
          </label>
          <input
            {...inputProps('email')}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="michael@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (authError) setAuthError(null);
            }}
          />
          {errorText('email')}
        </div>

        <div className="auth-field">
          <label className="field-label" htmlFor="auth-password">
            Password
          </label>
          <input
            {...inputProps('password')}
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            placeholder={isSignup ? `At least ${MIN_PASSWORD} characters` : 'Your password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (authError) setAuthError(null);
            }}
          />
          {errorText('password') ??
            (isSignup && (
              <p id="auth-password-hint" className="field-hint">
                Use {MIN_PASSWORD} or more characters.
              </p>
            ))}
        </div>

        {isSignup && (
          <div className="auth-field">
            <label className="field-label" htmlFor="auth-confirm">
              Confirm Password
            </label>
            <input
              {...inputProps('confirm')}
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {errorText('confirm')}
          </div>
        )}
      </div>

      <div className="skip-row">
        <button className="btn-link" onClick={switchMode}>
          {isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}
        </button>
      </div>
    </OnboardingLayout>
  );
}
