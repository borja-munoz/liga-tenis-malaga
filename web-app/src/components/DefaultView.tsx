import { Outlet } from 'react-router-dom';
import Header from './Header';
import ModalMessage from './ModalMessage';

export default function DefaultView() {
  return (
    <>
      <Header />
      <Outlet />
      <ModalMessage />
    </>
  );
}