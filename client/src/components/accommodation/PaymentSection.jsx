import { useRef } from "react";
import {
  CreditCard,
  Upload,
  Image as ImageIcon,
  X,
  FileText,
} from "lucide-react";

const PAYMENT_METHODS = [
  {
    value: "UPI",
    label: "UPI",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
  {
    value: "CASH",
    label: "Cash (Offline Verification)",
  },
];

const PaymentSection = ({
  paymentMode,
  setPaymentMode,
  transactionId,
  setTransactionId,
  paymentScreenshot,
  setPaymentScreenshot,
  remarks,
  setRemarks,
}) => {

  const inputRef = useRef(null);

  const preview =
    paymentScreenshot
      ? URL.createObjectURL(paymentScreenshot)
      : null;

  return (

    <div className="space-y-8">

      <div>

        <h3 className="text-2xl font-bold text-gray-900">
          Payment Details
        </h3>

        <p className="mt-2 text-gray-500">
          Complete your payment and upload the proof for verification.
        </p>

      </div>

      {/* Payment Method */}

      <div>

        <label className="mb-2 block font-medium">
          Payment Method
        </label>

        <select
          value={paymentMode}
          onChange={(e) =>
            setPaymentMode(e.target.value)
          }
          className="
            w-full
            rounded-xl
            border
            border-gray-300
            px-4
            py-4
            outline-none
            focus:border-blue-600
            focus:ring-2
            focus:ring-blue-200
          "
        >

          {PAYMENT_METHODS.map((method) => (

            <option
              key={method.value}
              value={method.value}
            >
              {method.label}
            </option>

          ))}

        </select>

      </div>

      {/* QR */}

      <div className="rounded-2xl border bg-blue-50 p-6">

        <h4 className="font-semibold text-gray-900">

          Scan & Pay

        </h4>

        <p className="mt-2 text-sm text-gray-600">

          Scan the QR Code using any UPI application
          and upload the payment screenshot.

        </p>

        <div className="mt-6 flex justify-center">

          <div className="flex h-60 w-60 items-center justify-center rounded-xl bg-white shadow">

            {/* Replace with actual QR */}

            <span className="text-gray-400">

              QR CODE

            </span>

          </div>

        </div>

      </div>

      {/* Transaction */}

      <div>

        <label className="mb-2 block font-medium">

          Transaction ID

        </label>

        <div className="relative">

          <CreditCard
            size={20}
            className="absolute left-4 top-4 text-gray-400"
          />

          <input
            value={transactionId}
            onChange={(e) =>
              setTransactionId(e.target.value)
            }
            placeholder="Enter Transaction ID"
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              py-4
              pl-12
              pr-5
              outline-none
              focus:border-blue-600
              focus:ring-2
              focus:ring-blue-200
            "
          />

        </div>

      </div>

      {/* Screenshot */}

      <div>

        <label className="mb-2 block font-medium">

          Payment Screenshot

        </label>

        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-xl
            border-2
            border-dashed
            border-blue-300
            bg-blue-50
            py-8
            text-blue-700
            transition
            hover:bg-blue-100
          "
        >

          <Upload size={22} />

          Upload Screenshot

        </button>

        <input
          hidden
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) =>
            setPaymentScreenshot(
              e.target.files[0]
            )
          }
        />

      </div>

      {/* Preview */}

      {preview && (

        <div className="rounded-xl border bg-white p-4">

          <div className="mb-4 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <ImageIcon size={18} />

              Payment Preview

            </div>

            <button
              type="button"
              onClick={() =>
                setPaymentScreenshot(null)
              }
            >

              <X />

            </button>

          </div>

          <img
            src={preview}
            alt="payment"
            className="rounded-xl"
          />

        </div>

      )}

      {/* Remarks */}

      <div>

        <label className="mb-2 block font-medium">

          Remarks (Optional)

        </label>

        <div className="relative">

          <FileText
            size={20}
            className="absolute left-4 top-4 text-gray-400"
          />

          <textarea
            rows={4}
            value={remarks}
            onChange={(e) =>
              setRemarks(e.target.value)
            }
            placeholder="Additional notes..."
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              py-4
              pl-12
              pr-4
              outline-none
              focus:border-blue-600
              focus:ring-2
              focus:ring-blue-200
            "
          />

        </div>

      </div>

    </div>

  );

};

export default PaymentSection;