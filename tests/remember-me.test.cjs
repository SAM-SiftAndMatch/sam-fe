const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

function harness(options = {}) {
  const states = [];
  const calls = [];
  const navigations = [];
  let index = 0;
  const formData = { email: 'user@example.com', password: 'password', ...options.formData };
  const source = ts.transpileModule(
    fs.readFileSync(require.resolve(`../src/pages/${options.page || 'LoginPage'}.tsx`), 'utf8'),
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
      if (name.endsWith('.css')) return {};
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
          useEffect() {},
        };
      if (name === 'react-hook-form')
        return {
          useForm: ({ defaultValues }) => {
            for (const [name, value] of Object.entries(defaultValues)) {
              if (!(name in formData)) formData[name] = value;
            }
            return {
              register: (name) => ({ name }),
              handleSubmit: (submit) => () => submit(formData),
              setValue: (name, value) => {
                formData[name] = value;
              },
              watch: (name) => formData[name],
              formState: { errors: {}, isSubmitting: false },
            };
          },
        };
      if (name === 'react-router-dom')
        return {
          Link: 'a',
          useNavigate: () => (destination) => navigations.push(destination),
          useLocation: () => ({ state: options.state || null }),
          useSearchParams: () => [new URLSearchParams()],
        };
      if (name.endsWith('/useAuthStore'))
        return {
          useAuthStore: () => ({
            login: async (data) => {
              calls.push(data);
              return { role: 'CLIENT' };
            },
            register: async (data) => {
              calls.push(data);
              if (options.registerError) {
                throw {
                  isAxiosError: true,
                  response: { data: { message: options.registerError } },
                };
              }
              return { role: data.accountType };
            },
          }),
        };
      if (name === '@/features/auth') return { loginSchema: {}, registerSchema: {} };
      if (name === '@hookform/resolvers/zod') return { zodResolver: () => undefined };
      if (name.endsWith('/google-auth')) return { googleAuthEnabled: true };
      if (name.endsWith('/GoogleLoginButton')) return { default: 'google-login-button' };
      if (name.endsWith('/AuthLayout')) return { default: 'auth-layout' };
      if (name.endsWith('/PolicyLinks'))
        return { default: 'policy-links', PolicyButton: 'policy-button' };
      if (name.endsWith('/InteractiveBackground')) return { InteractiveBackground: 'background' };
      if (name.endsWith('/SamBrandLogo')) return { default: 'brand' };
      if (name.endsWith('/lib/support')) return require('../src/lib/support.ts');
      if (name.endsWith('/routes/paths')) return require('../src/routes/paths.ts');
      return require(name);
    },
  });
  return {
    calls,
    navigations,
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

for (const [role, destination] of [
  ['CLIENT', '/client/profile'],
  ['FREELANCER', '/freelancer/profile/create'],
]) {
  test(`registration keeps the selected ${role} role for Google, API submission and navigation`, async () => {
    const h = harness({
      page: 'RegisterPage',
      formData: { fullName: 'Nguyễn An', agreeTerms: true },
    });
    let page = h.render();
    const roleButton = find(
      page,
      (el) =>
        el.type === 'button' &&
        React.Children.toArray(el.props.children).some(
          (child) =>
            React.isValidElement(child) &&
            child.props.children === (role === 'CLIENT' ? 'Khách hàng' : 'Freelancer')
        )
    );
    roleButton.props.onClick();
    page = h.render();
    assert.equal(find(page, (el) => el.type === 'google-login-button').props.role, role);
    await find(page, (el) => el.type === 'form').props.onSubmit();
    assert.deepEqual(
      { ...h.calls[0] },
      {
        email: 'user@example.com',
        password: 'password',
        fullName: 'Nguyễn An',
        accountType: role,
        acceptedTerms: true,
      }
    );
    assert.deepEqual(h.navigations, [destination]);
  });
}

test('failed registration retains the chosen account type and shows the server message', async () => {
  const h = harness({
    page: 'RegisterPage',
    state: { accountType: 'FREELANCER' },
    formData: { fullName: 'Nguyễn An', agreeTerms: true },
    registerError: 'Email đã được sử dụng.',
  });
  await find(h.render(), (el) => el.type === 'form').props.onSubmit();
  const page = h.render();
  assert.equal(find(page, (el) => el.type === 'google-login-button').props.role, 'FREELANCER');
  assert.ok(find(page, (el) => el.type === 'p' && el.props.children === 'Email đã được sử dụng.'));
  assert.deepEqual(h.navigations, []);
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
