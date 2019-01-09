import { withRouter } from "next/router";

const CustomerPage = ({ router }) => (
  <h1>
    Customer Id: {router.query.customerId} name: {router.query.customerName}
  </h1>
);
export default withRouter(CustomerPage);
