import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  XCircle,
  RotateCcw,
  FileText,
  User,
  Phone,
  Mail,
  Bike,
  Car,
  Search,
} from "lucide-react";
import axios from "../config/axios";
import { toast } from "react-toastify";

const PAGE_SIZE = 9;

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Processing", value: "processing" },
  { label: "Verified", value: "verified" },
  { label: "Re-upload", value: "reupload" },
  { label: "Rejected", value: "rejected" },
];

const DeliveryIdConfirm = () => {
  const [agents, setAgents] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [nextStatus, setNextStatus] = useState(null);
  const [reason, setReason] = useState("");

  /* ---------------- DEBOUNCE SEARCH ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- RESET LIST ---------------- */
  useEffect(() => {
    setAgents([]);
    setPage(0);
    setHasMore(true);
  }, [filter, debouncedSearch]);

  /* ---------------- FETCH AGENTS ---------------- */
  const fetchAgents = async () => {
    try {
      const res = await axios.get("/api/admin/delivery-agents", {
        params: {
          page,
          limit: PAGE_SIZE,
          status: filter !== "all" ? filter : undefined,
          search: debouncedSearch || undefined,
        },
      });
      setAgents((prev) => [...prev, ...res.data.data]);
      setHasMore(res.data.hasMore);
      setPage((prev) => prev + 1);
    } catch {
      toast.error("Failed to load agents");
    }
  };

  useEffect(() => {
    fetchAgents();
    // eslint-disable-next-line
  }, [filter, debouncedSearch]);

  /* ---------------- UPDATE STATUS ---------------- */
  const updateStatus = async () => {
    if ((nextStatus === "rejected" || nextStatus === "reupload") && !reason) {
      toast.error("Reason is required");
      return;
    }

    try {
      await axios.put(
        `/api/admin/delivery-agents/${selectedAgent._id}/${nextStatus}`,
        { status: nextStatus, reason }
      );

      toast.success("Status updated");

      setAgents((prev) =>
        prev.filter((a) => a._id !== selectedAgent._id)
      );
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSelectedAgent(null);
      setNextStatus(null);
      setReason("");
    }
  };

  /* ---------------- UI HELPERS ---------------- */
  const statusBadge = (status) => {
    const map = {
      processing: "bg-amber-100 text-amber-800 font-semibold h-fit font-mono border-2 border-amber-700",
      verified: "bg-blue-100 text-blue-800 font-semibold h-fit border-2 font-mono border-blue-700",
      rejected: "bg-rose-100 text-rose-800 font-semibold h-fit border-2 font-mono border-rose-700",
      reupload: "bg-indigo-100 text-indigo-800 font-semibold h-fit border-2 font-mono border-indigo-700",
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs ${map[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getStatusColor = (status) => {
    const map = {
      verified: "border-blue-600 text-blue-600 bg-blue-200 font-semibold font-mono",
      reupload: "border-orange-600 text-orange-600 bg-orange-200 font-semibold font-mono",
      rejected: "border-rose-600 text-rose-600 bg-rose-200 font-semibold font-mono",
    };
    return map[status] || "border-slate-600 text-slate-600 font-mono";
  }

  const vehicleIcon = (type) =>
    type === "car" ? <Car size={20} className="text-emerald-800" /> : type === "bike" ? <Bike size={20} className="text-sky-800"/> : type === "scooter" ? <Scooter size={20} className="text-indigo-800" /> : <Bicycle size={20} className="text-rose-800" />;

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <div className="w-full mx-auto">

        {/* HEADER */}
        <div className="mb-6 bg-white p-2 rounded-lg border border-zinc-300 shadow-md">
          <div className="p-2 border-l-4 rounded-lg border-gray-300 font-PublicSans">
          <h1 className="text-3xl font-bold">Agent Verification</h1>
          <p className="text-slate-500">
            Search, filter and manage verification requests
          </p>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* SEARCH */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-zinc-300 shadow-sm outline-none focus:border-indigo-500"
            />
          </div>

          {/* STATUS TABS */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-full text-sm
                  ${
                    filter === tab.value
                      ? "bg-emerald-600 text-white"
                      : "bg-white border"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* INFINITE SCROLL */}
        <InfiniteScroll
          dataLength={agents.length}
          next={fetchAgents}
          hasMore={hasMore}
          loader={
            <p className="text-center py-6 text-slate-500">
              Loading more agents...
            </p>
          }
          endMessage={
            <p className="text-center py-6 text-slate-400">
              No more results
            </p>
          }
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {agents.map((agent) => (
              <div
                key={agent._id}
                className="bg-white rounded-2xl shadow border overflow-hidden"
              >
                {/* HEADER */}
                <div className="p-4 border-b flex justify-between">
                  <div className="flex items-center gap-3">
                    {agent.faceImageUrl ? (
                      <img
                        onClick={() => window.open(agent.faceImageUrl, "_blank")}
                        src={agent.faceImageUrl}
                        className="h-12 w-12 rounded-full object-cover cursor-zoom-in"
                      />
                    ) : (
                      <User />
                    )}
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-blue-700 font-bold flex gap-1">
                        <Phone size={14} className="mt-1" /> {agent.phone}
                      </p>
                    </div>
                  </div>
                  {statusBadge(agent.verificationStatus)}
                </div>

                {/* BODY */}
                <div className="p-4 text-sm space-y-2">
                  <div className="flex gap-2">
                    <Mail size={16} className="mt-1 text-blue-800" /> {agent.email || "No email"}
                  </div>
                  <div className="flex gap-2 font-bold">
                    {vehicleIcon(agent.vehicle?.type)}
                    <span className="uppercase font-semibold">{agent.vehicle?.type}</span> • <span>{agent.vehicle?.number}</span>
                  </div>

                  {agent.aadhaarCardUrl && (
                    <button
                      onClick={() =>
                        window.open(agent.aadhaarCardUrl, "_blank")
                      }
                      className="text-emerald-800 flex gap-2 font-bold mt-2"
                    >
                      <FileText size={16} />
                      View Aadhaar
                    </button>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="p-3 bg-slate-50 flex gap-2">
                  {["verified", "reupload", "rejected"].map((s) => (
                    s !== agent.verificationStatus && (
                      <button
                      key={s}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setNextStatus(s);
                      }}
                      className={`flex-1 py-2 text-xs rounded-lg border ${getStatusColor(s)}`}
                      >
                      {s === "reupload" ? "RE-UPLOAD" : s.toUpperCase()}
                      </button>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </div>

      {/* MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-bold mb-3">
              Change status to {nextStatus.toUpperCase()}
            </h3>

            {(nextStatus === "rejected" || nextStatus === "reupload") && (
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Enter reason..."
              />
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={updateStatus}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryIdConfirm;
