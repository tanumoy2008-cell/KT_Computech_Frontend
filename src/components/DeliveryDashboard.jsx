import React from "react";
import { motion } from "framer-motion";
import {
  MdLocalShipping,
  MdDoneAll,
  MdPendingActions,
  MdAccessTime,
} from "react-icons/md";
import axios from '../config/axios';


const DeliveryDashboard = () => {
  const stats = [
    {
      title: "Orders Assigned",
      value: 0,
      icon: <MdLocalShipping />,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      title: "Delivered",
      value: 0,
      icon: <MdDoneAll />,
      color: "from-sky-400 to-sky-600",
    },
    {
      title: "Pending",
      value: 0,
      icon: <MdPendingActions />,
      color: "from-amber-400 to-amber-600",
    },
    {
      title: "Avg Delivery Time",
      value: "0 min",
      icon: <MdAccessTime />,
      color: "from-pink-400 to-pink-600",
    },
  ];
  return (
    <div className="h-fit text-white">

      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-extrabold tracking-tight">
          🚀 Agent Dashboard
        </h1>
        <p className="text-white/60 mt-2 text-lg">
          Track your deliveries, performance & speed in real time
        </p>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-xl"
          >
            {/* GLOW */}
            <div
              className={`absolute inset-0 opacity-20 bg-gradient-to-br ${item.color}`}
            />

            <div className="relative p-6 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm uppercase tracking-wider">
                  {item.title}
                </p>
                <h2 className="text-3xl font-bold mt-2">
                  {item.value}
                </h2>
              </div>

              <div
                className={`text-4xl p-4 rounded-xl bg-gradient-to-br ${item.color} text-black shadow-lg`}
              >
                {item.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* STATUS CARD */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30">
          <h3 className="text-2xl font-bold mb-4">🟢 Current Status</h3>
          <p className="text-lg text-white/80">
            You are currently
            <span className="text-emerald-400 font-semibold"> ONLINE </span>
            and available for deliveries.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold shadow-lg"
          >
            Go Offline
          </motion.button>
        </div>

        {/* MOTIVATION CARD */}
        <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
          <h3 className="text-2xl font-bold mb-4">🔥 Today’s Goal</h3>
          <p className="text-white/70 mb-4">
            Complete at least <span className="font-bold text-white">20 deliveries </span>
            to unlock bonus incentives.
          </p>

          {/* PROGRESS */}
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "0%" }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
            />
          </div>

          <p className="mt-2 text-sm text-white/50">
            0 / 20 deliveries completed
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DeliveryDashboard;
