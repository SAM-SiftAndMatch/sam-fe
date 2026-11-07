import { Navigate } from 'react-router-dom';
/** Navigation only; fulfillment is confirmed by the Pay2S IPN. */
export default function JobAddonReturnPage() {
  return <Navigate to="/payment/return" replace />;
}
