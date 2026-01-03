import React, { useEffect, useRef, useState } from "react";
import axios from "../config/axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Swal from "sweetalert2";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  setProducts,
  setPagination,
  setFilters,
  setScrollY,
  clearScrollY,
} from "../Store/reducers/AdminProductReducer";
import { setProducts as setPublicProducts } from "../Store/reducers/ProductReducer";

const AdminProducts = () => {
  const admin = useSelector((state) => state.AdminReducer);
  const dispatch = useDispatch();
  const { items, start, hasMore, query, maincategory, subcategory, scrollY } =
    useSelector((state) => state.adminProductReducer);
  const publicItems = useSelector((state) => state.ProductReducer.items);

  const [maincategories, setMaincategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  // Local search state to avoid input lag while typing
  const [searchTerm, setSearchTerm] = useState(query || "");
  const [isLoading, setIsLoading] = useState(false);
  const [openMain, setOpenMain] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingVisibilityIds, setLoadingVisibilityIds] = useState([]);
  const limit = 12;
  const scrollRef = useRef(null);

  const [lastMainCategory, setLastMainCategory] = useState(maincategory);
  const [lastSubCategory, setLastSubCategory] = useState(subcategory);
  const [lastQuery, setLastQuery] = useState(query);

  // ======================= FETCH PRODUCTS =======================
  const fetchData = async (reset = false) => {
    if (!reset && !hasMore) return;
    setIsLoading(true);
    try {
      const res = await axios.get("/api/product/productDetails", {
        params: {
          start: reset ? 0 : start,
          limit,
          query,
          Maincategory: maincategory,
          Subcategory: subcategory,
        },
      });

      const fetched = res.data?.product || [];

      dispatch(
        setProducts({
          products: fetched,
          reset,
        })
      );

      dispatch(
        setPagination({
          start: res.data.nextStart || 0,
          hasMore: res.data.hasMore ?? false,
        })
      );

      if (res.data.maincategories) setMaincategories(res.data.maincategories);
      if (res.data.subcategories) setSubcategories(res.data.subcategories);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
      toast.error("Failed to fetch products!");
    } finally {
      setIsLoading(false);
    }
  };

  // ======================= INITIAL LOAD =======================
  useEffect(() => {
    if (isInitialLoad && items.length === 0) {
      fetchData(true);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, items.length]);

  // ======================= FILTER / SEARCH =======================
  useEffect(() => {
    const filterChanged =
      maincategory !== lastMainCategory || subcategory !== lastSubCategory;

    if (query !== lastQuery || filterChanged) {
      fetchData(true);
      dispatch(clearScrollY());
      setLastQuery(query);
      setLastMainCategory(maincategory);
      setLastSubCategory(subcategory);
    }
  }, [query, maincategory, subcategory]);

  // ✅ Debounce query input
  const debounceTimer = useRef(null);
  const handleSearch = (value) => {
    const sanitized = value.replace(/[\r\n]/g, "").trim();
    dispatch(setFilters({ query: sanitized }));
  };

  const onSearchChange = (e) => {
    const value = e.target.value;
    // update local input immediately for smooth typing
    setSearchTerm(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => handleSearch(value.trim()), 500);
  };

  // Keep local input in sync if query is changed externally (clear filters, etc.)
  useEffect(() => {
    setSearchTerm(query || "");
  }, [query]);

  // ======================= RESTORE SCROLL =======================
  useEffect(() => {
    if (!scrollRef.current) return;
    if (scrollY === 0) return;

    const timer = setTimeout(() => {
      scrollRef.current.scrollTo({
        top: scrollY,
        behavior: "auto",
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [scrollY, items.length]);

  // ======================= SAVE SCROLL =======================
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      dispatch(setScrollY(container.scrollTop));
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [dispatch]);

  // ======================= DELETE HANDLER =======================
  const roleHandler = ({ id }) => {
    if (admin.role === "admin") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You are not Super Admin",
        footer: "Contact Super Admin",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`/api/product/product-delete/${id}`);
          if (res.status === 200) {
            Swal.fire({
              title: "Deleted!",
              text: res.data.message,
              icon: "success",
            });
            dispatch(
              setProducts({
                products: items.filter((item) => item._id !== id),
                reset: true,
              })
            );
          } else toast.error(res.data.message);
        } catch {
          toast.error("Delete failed!");
        }
      }
    });
  };

  // ======================= SKELETON ROW =======================
  const SkeletonRow = () => (
    <div className="flex w-full items-center gap-x-2 border py-2 px-1 rounded animate-pulse bg-gray-100">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="w-[10%] h-4 bg-gray-300 rounded"></div>
      ))}
    </div>
  );

  // ======================= UI =======================
  return (
    <div className="min-h-screen w-full bg-gray-200 p-4 flex flex-col gap-y-6 text-gray-800">
      <div className="w-full mx-auto">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4 flex items-center gap-4">
          <div className="w-1 h-12 bg-indigo-100 rounded" />
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              All Products
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage inventory — relaxed view for long working sessions
            </p>
          </div>
        </div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 bg-white shadow-sm px-4 py-4 rounded-2xl items-center border border-gray-200 mt-4">
          <div className="w-full sm:w-[40%] relative border-l-4 border-indigo-100 pl-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z"
                />
              </svg>
            </span>
            <input
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search name, company or barcode"
              className="w-full border border-gray-400 bg-gray-50 pl-5 pr-4 py-2 outline-none rounded-full text-sm"
            />
            {query && (
              <button
                onClick={() => dispatch(setFilters({ query: "" }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 px-2 py-1 rounded text-sm text-gray-600"
                aria-label="Clear search">
                Clear
              </button>
            )}
          </div>
          <div className="relative w-full sm:w-[30%]">
            <button
              onClick={() => {
                setOpenMain(!openMain);
                setOpenSub(false);
              }}
              className="w-full border px-4 py-2 rounded-md flex justify-between items-center bg-white">
              <span className="capitalize">
                {maincategory === "all" ? "Select Main Category" : maincategory}
              </span>
              <span
                className={`text-gray-500 transition-all duration-500 ${
                  openMain ? "rotate-180" : "rotate-0"
                }`}>
                ▾
              </span>
            </button>
            {/* MAIN CATEGORY DROPDOWN */}
            {openMain && (
              <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-md max-h-56 overflow-auto">
                {maincategories.map((cat, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      dispatch(
                        setFilters({ maincategory: cat, subcategory: "" })
                      );
                      setOpenMain(false);
                    }}
                    className="px-4 py-2 capitalize cursor-pointer transition-colors duration-300 hover:bg-emerald-800 hover:text-white">
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* SUB CATEGORY DROPDOWN */}
          <div className="relative w-full sm:w-[30%]">
            <button
              onClick={() => {
                setOpenSub(!openSub);
                setOpenMain(false);
              }}
              className="w-full border px-4 py-2 rounded-md flex justify-between items-center bg-white">
              <span className="capitalize">
                {subcategory || "Select Sub Category"}
              </span>
              <span
                className={`text-gray-500 transition-all duration-500 ${
                  openSub ? "rotate-180" : "rotate-0"
                }`}>
                ▾
              </span>
            </button>

            {openSub && (
              <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-md max-h-56 overflow-auto">
                {subcategories.map((sub, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      dispatch(setFilters({ subcategory: sub.key }));
                      setOpenSub(false);
                    }}
                    className="px-4 py-2 cursor-pointer transition-colors duration-300 hover:bg-emerald-700 hover:text-white">
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Table */}
        <div className="w-full h-[85vh] py-4 px-4 rounded-xl border-2 border-gray-100 bg-white flex flex-col mt-3">
          <div className="grid grid-cols-11 uppercase w-full p-3 rounded-md bg-indigo-50 text-sm text-gray-700 font-semibold mb-3 border-b-2 border border-gray-400">
            <h1 className="text-center">Pic</h1>
            <h1 className="text-center">Name</h1>
            <h1 className="text-center">Company</h1>
            <h1 className="text-center">Main</h1>
            <h1 className="text-center">Sub</h1>
            <h1 className="text-center">Price</h1>
            <h1 className="text-center">Stock</h1>
            <h1 className="text-center">Visible</h1>
            <h1 className="text-center">Barcodes</h1>
            <h1 className="text-center">Edit</h1>
            <h1 className="text-center">Delete</h1>
          </div>

          <div
            id="scrollableDiv"
            ref={scrollRef}
            className="overflow-auto h-[calc(80vh-50px)]">
            <InfiniteScroll
              dataLength={items.length}
              next={() => fetchData(false)}
              hasMore={hasMore}
              loader={Array.from({ length: limit }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
              scrollableTarget="scrollableDiv"
              endMessage={
                <p className="text-center text-gray-400 py-4">
                  🎉 You have reached the end!
                </p>
              }
              className="flex flex-col gap-y-4 py-2">
              {items.map((p) => (
                <div
                  key={p._id}
                  className="grid grid-cols-11 w-full items-center gap-x-3 border-2 border-gray-400 py-3 px-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-white border-l-6 hover:border-emerald-400 hover:-translate-y-1">
                  <div className=" flex items-center justify-center">
                    <img
                      src={
                        p.colorVariants?.[0]?.images?.[0] || "/placeholder.png"
                      }
                      alt="prod"
                      className="w-14 h-14 object-cover rounded-lg border"
                    />
                  </div>
                  <h1 className="text-center text-sm">{p.name}</h1>
                  <h1 className="text-center text-sm">{p.company}</h1>
                  <h1 className="text-center text-sm">{p.Maincategory}</h1>
                  <h1 className="text-center text-sm">{p.Subcategory}</h1>
                  <h1 className="text-center text-sm">{p.price}</h1>
                  <h1 className="text-center text-sm">{p.stock}</h1>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Toggle switch */}
                      {admin?.role === "admin" ||
                      admin?.role === "superAdmin" ? (
                        <label
                          className={`
                                  relative flex flex-col gap-y-2
                                  ${
                                    loadingVisibilityIds.includes(p._id)
                                      ? "opacity-60 cursor-wait"
                                      : "cursor-pointer"
                                  }
                                `}>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={Boolean(p.visibility)}
                            disabled={loadingVisibilityIds.includes(p._id)}
                            onChange={async (e) => {
                              const newVal = e.target.checked;
                              try {
                                setLoadingVisibilityIds((s) => [...s, p._id]);

                                const resp = await axios.patch(
                                  `/api/product/visibility/${p._id}`,
                                  { visibility: newVal }
                                );

                                if (resp?.data?.product) {
                                  const updatedList = items.map((it) =>
                                    it._id === p._id
                                      ? {
                                          ...it,
                                          visibility:
                                            resp.data.product.visibility,
                                        }
                                      : it
                                  );

                                  dispatch(
                                    setProducts({
                                      products: updatedList,
                                      reset: true,
                                    })
                                  );

                                  // ----- sync public store -----
                                  try {
                                    const prod = resp.data.product;
                                    const exists = publicItems.some(
                                      (pi) => pi._id === prod._id
                                    );

                                    let updatedPublic;

                                    if (!prod.visibility) {
                                      updatedPublic = publicItems.filter(
                                        (pi) => pi._id !== prod._id
                                      );
                                    } else if (exists) {
                                      updatedPublic = publicItems.map((pi) =>
                                        pi._id === prod._id
                                          ? {
                                              ...pi,
                                              visibility: prod.visibility,
                                            }
                                          : pi
                                      );
                                    } else {
                                      updatedPublic = [prod, ...publicItems];
                                    }

                                    dispatch(
                                      setPublicProducts({
                                        products: updatedPublic,
                                        reset: true,
                                      })
                                    );
                                  } catch {}

                                  toast.success(
                                    resp.data.message || "Visibility updated"
                                  );
                                } else {
                                  toast.error("Failed to update visibility");
                                }
                              } catch (err) {
                                toast.error(
                                  err.response?.data?.message || "Update failed"
                                );
                              } finally {
                                setLoadingVisibilityIds((s) =>
                                  s.filter((id) => id !== p._id)
                                );
                              }
                            }}
                          />

                          {/* TRACK */}
                          <div
                            className={`
                                w-12 h-6 rounded-full transition-all duration-300
                                shadow-inner
                                peer-checked:bg-emerald-500
                                peer-not-checked:bg-gray-300
                              `}></div>

                          {/* KNOB */}
                          <span
                            className={`
                              absolute left-0.5 top-0.5
                              w-5 h-5 bg-white rounded-full
                              transition-all duration-300 shadow-md
                              peer-checked:translate-x-6
                              peer-not-checked:translate-x-0
                            `}></span>

                          {/* STATUS TEXT */}
                          <span
                            className={`
                                text-xs text-center font-semibold select-none
                                ${p.visibility ? "text-emerald-600" : "text-gray-500"}
                              `}>
                            {p.visibility ? "Visible" : "Hidden"}
                          </span>

                          {/* LOADING SPINNER */}
                          {loadingVisibilityIds.includes(p._id) && (
                            <span className="animate-spin text-gray-500 text-sm">
                              ⏳
                            </span>
                          )}
                        </label>
                      ) : (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            p.visibility
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                          {p.visibility ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-center flex flex-col items-center overflow-x-auto">
                    {p.codes?.length
                      ? p.codes.map((code, idx) => (
                          <span
                            key={idx}
                            className="block w-full text-[10px] bg-gray-100 border rounded-md py-1 px-2 my-1">
                            {code}
                          </span>
                        ))
                      : "—"}
                  </div>
                  <Link
                    to={`/product-edit/${p._id}`}
                    className="bg-green-400 px-2 py-2 text-center text-white rounded-md hover:bg-green-600">
                    Edit
                  </Link>
                  <h1
                    onClick={() => roleHandler({ id: p._id })}
                    className="bg-red-400 px-2 py-2 text-center text-white rounded-md hover:bg-red-600 cursor-pointer">
                    Delete
                  </h1>
                </div>
              ))}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
