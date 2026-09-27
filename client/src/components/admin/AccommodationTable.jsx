import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
  Bed,
  Image as ImageIcon,
} from "lucide-react";

import {
  getAllAccommodationBookings,
  getAccommodationStats,
  confirmAccommodation,
  markAccommodationPaymentPaid,
  rejectAccommodation,
} from "../../api/accommodation.api";

const PAGE_LIMIT = 10;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClasses = (status) => {
  switch (status) {
    case "CONFIRMED":
    case "PAID":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    case "PENDING":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "CANCELLED":
    case "FAILED":
    case "REJECTED":
      return "border-red-500/20 bg-red-500/10 text-red-400";
    case "REFUNDED":
      return "border-purple-500/20 bg-purple-500/10 text-purple-400";
    default:
      return "border-white/10 bg-white/5 text-slate-400";
  }
};

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${getStatusClasses(
        value
      )}`}
    >
      {value || "—"}
    </span>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-xl bg-white/[0.03]"
        />
      ))}
    </div>
  );
}

function DetailCard({ title, items }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-violet-400">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-5 border-b border-white/5 pb-2.5 last:border-0 last:pb-0"
          >
            <span className="text-xs text-slate-500">{label}</span>
            <span className="max-w-[65%] break-words text-right text-sm font-medium text-slate-200">
              {value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenshotModal({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Payment Proof</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 flex justify-center bg-slate-950 overflow-auto max-h-[calc(90vh-70px)]">
          <img src={url} alt="Payment Proof" className="max-w-full max-h-full object-contain" />
        </div>
      </div>
    </div>
  );
}

function AccommodationDetailsModal({
  booking,
  onClose,
  onApprove,
  onReject,
  onConfirm,
  updating,
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Booking Details</h2>
            <p className="text-xs text-slate-500">ID: {booking._id || booking.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <DetailCard
              title="Guest Information"
              items={[
                ["Name", booking.participantName || booking.user?.fullName],
                ["Email", booking.participantEmail || booking.user?.email],
                ["Phone", booking.participantPhone],
                ["College ID", booking.collegeId || booking.user?.collegeId],
                ["Department", booking.department],
                ["Year", booking.yearOfStudy],
              ]}
            />
            <DetailCard
              title="Accommodation Details"
              items={[
                ["Hostel Type", booking.hostelType],
                ["Check-in", formatDate(booking.checkInDate)],
                ["Check-out", formatDate(booking.checkOutDate)],
                ["Days", booking.accommodationDays?.toString()],
                ["Amount", `₹${booking.amount}`],
                ["Remarks", booking.remarks],
              ]}
            />
            <DetailCard
              title="Payment Status"
              items={[
                ["Status", booking.paymentStatus],
                ["Proof Uploaded", booking.payment?.screenshotUrl ? "Yes" : "No"],
                ["Approved By", booking.payment?.approvedBy ? "Admin" : "—"],
                ["Admin Note", booking.payment?.adminNote],
              ]}
            />
            <DetailCard
              title="Booking Status"
              items={[
                ["Status", booking.bookingStatus],
                ["Conf. Code", booking.confirmationCode],
                ["Confirmed At", formatDate(booking.confirmedAt)],
                ["Rejection Reason", booking.rejectionReason],
              ]}
            />
          </div>

          <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="text-sm font-bold text-white">Actions</h3>
            
            {booking.paymentStatus === "PENDING" && !showRejectInput && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => onApprove(booking.id || booking._id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  Approve Payment
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setShowRejectInput(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  Reject Payment
                </button>
              </div>
            )}

            {showRejectInput && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Reason for rejection (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => onReject(booking.id || booking._id, rejectReason)}
                    className="flex flex-1 items-center justify-center rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(false)}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {booking.paymentStatus === "PAID" && booking.bookingStatus === "PENDING" && (
              <button
                type="button"
                disabled={updating}
                onClick={() => onConfirm(booking.id || booking._id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccommodationTable() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 });
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchBookings = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllAccommodationBookings({ page, limit: PAGE_LIMIT });
      setBookings(res?.data || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Failed to load accommodations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const s = await getAccommodationStats();
      setStats(s);
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings(1);
    fetchStats();
  }, [fetchBookings, fetchStats]);

  const handleApprove = async (id) => {
    try {
      setUpdating(true);
      await markAccommodationPaymentPaid(id);
      await fetchBookings(pagination.page);
      await fetchStats();
      setSelectedBooking(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to approve payment");
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async (id, reason) => {
    try {
      setUpdating(true);
      await rejectAccommodation(id, { reason });
      await fetchBookings(pagination.page);
      await fetchStats();
      setSelectedBooking(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reject payment");
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      setUpdating(true);
      await confirmAccommodation(id);
      await fetchBookings(pagination.page);
      await fetchStats();
      setSelectedBooking(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to confirm booking");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Accommodations</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage student accommodation bookings and payments
          </p>
        </div>
        <button
          onClick={() => { fetchBookings(pagination.page); fetchStats(); }}
          className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Bookings</p>
            <p className="mt-2 text-2xl font-bold text-white">{stats.total || 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Pending Bookings</p>
            <p className="mt-2 text-2xl font-bold text-white">{stats.pending || 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Confirmed Bookings</p>
            <p className="mt-2 text-2xl font-bold text-white">{stats.confirmed || 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">Paid Bookings</p>
            <p className="mt-2 text-2xl font-bold text-white">{stats.paid || 0}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/5 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Booking</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6">
                    <LoadingRows />
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">
                    <Bed size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No bookings found</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id || booking._id} className="transition hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{booking.participantName || booking.user?.fullName || "—"}</div>
                      <div className="text-xs text-slate-500">{booking.participantEmail || booking.user?.email || "—"}</div>
                      <div className="text-xs text-slate-500">{booking.participantPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div>{formatDate(booking.checkInDate)} →</div>
                      <div>{formatDate(booking.checkOutDate)}</div>
                      <div className="text-xs text-slate-500">{booking.accommodationDays} days</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      ₹{booking.amount}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge value={booking.paymentStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge value={booking.bookingStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.payment?.screenshotUrl && (
                          <button
                            type="button"
                            onClick={() => setScreenshotUrl(booking.payment.screenshotUrl)}
                            className="rounded-lg bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            title="View Payment Proof"
                          >
                            <ImageIcon size={18} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(booking)}
                          className="rounded-lg bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 text-sm text-slate-400">
            <div>
              Showing page <span className="font-medium text-white">{pagination.page}</span> of <span className="font-medium text-white">{pagination.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchBookings(pagination.page - 1)}
                className="rounded-lg border border-white/10 p-2 transition hover:bg-white/5 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchBookings(pagination.page + 1)}
                className="rounded-lg border border-white/10 p-2 transition hover:bg-white/5 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedBooking && (
        <AccommodationDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onConfirm={handleConfirm}
          updating={updating}
        />
      )}

      {screenshotUrl && (
        <ScreenshotModal
          url={screenshotUrl}
          onClose={() => setScreenshotUrl(null)}
        />
      )}
    </div>
  );
}
