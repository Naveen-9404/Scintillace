const PAYMENT_STATUS = Object.freeze({
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
});

const PAYMENT_FOR = Object.freeze({
  EVENT: "EVENT",
  ACCOMMODATION: "ACCOMMODATION",
});

const PAYMENT_GATEWAY = Object.freeze({
  UPI: "UPI",
});

export {
  PAYMENT_STATUS,
  PAYMENT_FOR,
  PAYMENT_GATEWAY,
};