'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toast = () => {
  return (
    <ToastContainer
      autoClose={2000}
      pauseOnFocusLoss={false}
    />
  );
};

export { Toast };