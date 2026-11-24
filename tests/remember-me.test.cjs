const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

function harness() {
  const states = [];
  const calls = [];
  let index = 0;
  const formData = { email: 'user@example.com', password: 'password' };
  const source = ts.transpileModule(
    fs.readFileSync(require.resolve('../src/pages/LoginPage.tsx'), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: false,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === 'react')
        return {
          ...React,
          useState(initial) {
            const position = index++;
            if (!(position in states)) states[position] = initial;
            return [
              states[position],
              (value) => {
                states[position] = value;
              },
            ];
          },
        };
      if (name === 'react-hook-form')
        return {
          useForm: () => ({
            register: (name) => ({ name }),
            handleSubmit: (submit) => () => submit(formData),
            formState: { errors: {}, isSubmitting: false },
          }),
        };
      if (name === 'react-router-dom')
        return {
          Link: 'a',
          useNavigate: () => () => {},
          useLocation: () => ({ state: null }),
          useSearchParams: () => [new URLSearchParams()],
        };
      if (name.endsWith('/useAuthStore'))
        return {
          useAuthStore: () => ({
            login: async (data) => {
              calls.push(data);
              return { role: 'CLIENT' };
            },
          }),
        };
      if (name === '@/features/auth') return { loginSchema: {} };
      if (name === '@hookform/resolvers/zod') return { zodResolver: () => undefined };
      if (name.endsWith('/google-auth')) return { googleAuthEnabled: true };
      if (name.endsWith('/GoogleLoginButton')) return { default: 'google-login-button' };
      if (name.endsWith('/PolicyLinks')) return { PolicyButton: 'policy-button' };
      if (name.endsWith('/InteractiveBackground')) return { InteractiveBackground: 'background' };
      if (name.endsWith('/SamBrandLogo')) return { default: 'brand' };
      if (name.endsWith('/routes/paths')) return {};
      return require(name);
    },
  });
  return {
    calls,
    render() {
      index = 0;
      return exports.default();
    },
  };
}

function find(element, predicate) {
  if (!React.isValidElement(element)) return null;
  if (predicate(element)) return element;
  for (const child of React.Children.toArray(element.props.children)) {
    const found = find(child, predicate);
    if (found) return found;
  }
  return null;
}

test('login defaults to a browser session and sends explicit opt-in and opt-out', async () => {
  const h = harness();
  let page = h.render();
  assert.equal(find(page, (el) => el.props.id === 'remember_me').props.checked, false);
  await find(page, (el) => el.type === 'form').props.onSubmit();
  assert.equal(h.calls.at(-1).rememberMe, false);

  for (const checked of [true, false]) {
    find(page, (el) => el.props.id === 'remember_me').props.onChange({ target: { checked } });
    page = h.render();
    await find(page, (el) => el.type === 'form').props.onSubmit();
    assert.equal(h.calls.at(-1).rememberMe, checked);
    assert.equal(h.calls.at(-1).email, 'user@example.com');
    assert.equal(find(page, (el) => el.type === 'google-login-button').props.rememberMe, checked);
  }
});

test('Google login transports the preference to the OAuth start endpoint', () => {
  const source = ts.transpileModule(
    fs.readFileSync(require.resolve('../src/components/GoogleLoginButton.tsx'), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: false,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name.endsWith('/google-auth'))
        return {
          googleAuthEnabled: true,
          googleAuthStartUrl: 'https://api.sam.example/api/v1/auth/google/start',
        };
      if (name.endsWith('.png')) return { default: 'google.png' };
      return require(name);
    },
  });
  for (const rememberMe of [false, true]) {
    const link = exports.default({ rememberMe });
    assert.equal(new URL(link.props.href).searchParams.get('rememberMe'), String(rememberMe));
  }
  assert.equal(new URL(exports.default({}).props.href).searchParams.get('rememberMe'), 'false');
});
