import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { mountToastHost } from '../lib/toast-host';
import { useThemeStore } from '../stores/useThemeStore';

export default function AppToastContainer() {
  const theme = useThemeStore((state) => state.theme);
  const [host] = useState(() => document.createElement('div'));
  useEffect(() => mountToastHost(host), [host]);

  return createPortal(
    <ToastContainer
      position="top-right"
      autoClose={5000}
      newestOnTop
      closeOnClick
      pauseOnHover
      pauseOnFocusLoss
      draggable={false}
      limit={3}
      theme={theme}
      toastClassName="font-sans text-sm"
      aria-label="Thông báo hệ thống"
    />,
    host
  );
}
