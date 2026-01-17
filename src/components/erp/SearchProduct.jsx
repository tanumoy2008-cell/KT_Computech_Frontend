import { useState, useEffect } from "react";
import axios from "../../config/axios";

const SearchProduct = ({ onSelect, clearSignal, initialValue }) => {
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);

  // clear input when parent signals (e.g., after item added)
  useEffect(() => {
    if (clearSignal === undefined) return;
    setQ("");
    setList([]);
  }, [clearSignal]);

  // set initial input value when parent requests (e.g., edit)
  useEffect(() => {
    if (initialValue === undefined || initialValue === null) return;
    setQ(initialValue || "");
  }, [initialValue]);

  useEffect(() => {
    if (!q) return setList([]);

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/api/product/by-name/${encodeURIComponent(q)}`
        );
        setList(res.data?.data || res.data || []);
      } catch (err) {
        setList([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="relative">
      <input
        className="border p-2 rounded w-full"
        placeholder="Search product"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {list.length > 0 && (
        <div className="absolute bg-white border h-72 overflow-y-scroll w-96 z-10">
          {list.map((p) => (
            <div
              key={p._id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(p);
                // show selected product name in input so user sees the selection
                setQ(p.name || "");
                setList([]);
              }}>
              {p.name} – ₹{p.price}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchProduct;
