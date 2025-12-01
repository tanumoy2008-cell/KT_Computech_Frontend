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
  const admin = useSelector((state) => state.AdminReducer)
  const dispatch = useDispatch();
  const {
    items,
    start,
    hasMore,
    query,
    maincategory,
    subcategory,
    scrollY,
  } = useSelector((state) => state.adminProductReducer);
  const publicItems = useSelector((state) => state.ProductReducer.items);

  const [maincategories, setMaincategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => handleSearch(value), 400);
  };

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
    <div className="min-h-screen w-full bg-gray-300 p-2 md:p-4 lg:px-6 lg:py-2 flex flex-col gap-y-5">
    <div>
    <h1 className="text-4xl font-bold font-PublicSans">All Products</h1>  
    </div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 border border-black/50 bg-white px-4 py-4 rounded-lg items-center">
        <input
          defaultValue={query}
          onChange={onSearchChange}
          placeholder="Search by name, company, or 13-digit barcode..."
          className="w-full sm:w-[40%] border px-4 py-2 outline-none rounded-md"
        />
        <select
          value={maincategory}
          onChange={(e) =>
            dispatch(
              setFilters({ maincategory: e.target.value, subcategory: "" })
            )
          }
          className="w-full sm:w-[30%] border px-4 py-2 outline-none rounded-md"
        >
          <option value="all">All Categories</option>
          {maincategories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={subcategory}
          onChange={(e) =>
            dispatch(setFilters({ subcategory: e.target.value }))
          }
          className="w-full sm:w-[30%] border px-4 py-2 outline-none rounded-md"
        >
          {subcategories.map((sub, i) => (
            <option key={i} value={sub.key}>
              {sub.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <div className="w-full h-[80vh] py-4 px-4 rounded-md border border-black/50 bg-white flex flex-col">
        <div className="flex w-full border p-2 rounded-md bg-black/90 font-bold gap-x-2 text-center mb-2 text-lg">
          <h1 className="w-[14%] py-2 rounded bg-sky-300">Name</h1>
          <h1 className="w-[14%] py-2 rounded bg-yellow-300">Company</h1>
          <h1 className="w-[14%] py-2 rounded bg-orange-300">Main</h1>
          <h1 className="w-[14%] py-2 rounded bg-red-400">Sub</h1>
          <h1 className="w-[8%] py-2 rounded bg-violet-300">Price</h1>
          <h1 className="w-[8%] py-2 rounded bg-amber-300">Stock</h1>
          <h1 className="w-[6%] py-2 rounded bg-indigo-300">Visible</h1>
          <h1 className="w-[16%] py-2 rounded bg-slate-400">Barcodes</h1>
          <h1 className="w-[9%] py-2 rounded px-2 bg-green-300">Edit</h1>
          <h1 className="w-[9%] py-2 rounded px-2 bg-red-300">Delete</h1>
        </div>

        <div
          id="scrollableDiv"
          ref={scrollRef}
          className="overflow-auto h-[calc(75vh-50px)]"
        >
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
            className="flex flex-col gap-y-2"
          >
            {items.map((p) => (
              <div
                key={p._id}
                className="flex w-full items-center gap-x-2 border py-2 px-1 rounded hover:bg-gray-50 transition-all"
              >
                <h1 className="w-[14%] text-center">{p.name}</h1>
                <h1 className="w-[14%] text-center">{p.company}</h1>
                <h1 className="w-[14%] text-center">{p.Maincategory}</h1>
                <h1 className="w-[14%] text-center">{p.Subcategory}</h1>
                <h1 className="w-[8%] text-center">{p.price}</h1>
                <h1 className="w-[8%] text-center">{p.stock}</h1>
                <div className="w-[6%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* Toggle switch */}
                    {(admin?.role === 'admin' || admin?.role === 'superAdmin') ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={Boolean(p.visibility)}
                          disabled={loadingVisibilityIds.includes(p._id)}
                          onChange={async (e) => {
                              // Direct toggle (no confirm) — simple switch
                              const newVal = e.target.checked;
                              try {
                                setLoadingVisibilityIds((s) => [...s, p._id]);
                                const resp = await axios.patch(`/api/product/visibility/${p._id}`, { visibility: newVal });
                                if (resp?.data?.product) {
                                  // Merge visibility into existing item to preserve computed fields (stock, codes, etc.)
                                  const updatedList = items.map((it) =>
                                    it._id === p._id ? { ...it, visibility: resp.data.product.visibility } : it
                                  );
                                  dispatch(setProducts({ products: updatedList, reset: true }));

                                  // Sync public product list so storefront immediately reflects change
                                  try {
                                    const prod = resp.data.product;
                                    const exists = publicItems.some((pi) => pi._id === prod._id);
                                    let updatedPublic;
                                    if (prod.visibility === false) {
                                      updatedPublic = publicItems.filter((pi) => pi._id !== prod._id);
                                    } else {
                                      // If public item exists, only update visibility to preserve other fields;
                                      // otherwise prepend the returned product (may be minimal).
                                      if (exists) {
                                        updatedPublic = publicItems.map((pi) =>
                                          pi._id === prod._id ? { ...pi, visibility: prod.visibility } : pi
                                        );
                                      } else {
                                        updatedPublic = [prod, ...publicItems];
                                      }
                                    }
                                    dispatch(setPublicProducts({ products: updatedPublic, reset: true }));
                                  } catch (e) {
                                    console.warn('Failed to sync public products after visibility change', e);
                                  }

                                  toast.success(resp.data.message || 'Visibility updated');
                                } else {
                                  toast.error('Failed to update visibility');
                                }
                              } catch (err) {
                                console.error('Visibility toggle error', err);
                                if (err.response?.status === 403) {
                                  toast.error('Forbidden: insufficient permissions');
                                } else {
                                  toast.error(err.response?.data?.message || 'Update failed');
                                }
                              } finally {
                                setLoadingVisibilityIds((s) => s.filter((id) => id !== p._id));
                              }
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 peer-checked:bg-green-600 transition-colors"></div>
                        <span className="ml-2 text-xs text-gray-700">{p.visibility ? 'On' : 'Off'}</span>
                      </label>
                    ) : (
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${p.visibility ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.visibility ? 'Yes' : 'No'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-[16%] text-center flex flex-col items-center overflow-x-auto">
                  {p.codes?.length
                    ? p.codes.map((code, idx) => (
                        <span
                          key={idx}
                          className="block text-xs bg-gray-100 border rounded-md py-1 px-2 my-1 w-fit"
                        >
                          {code}
                        </span>
                      ))
                    : "—"}
                </div>
                <Link
                  to={`/product-edit/${p._id}`}
                  className="w-[9%] bg-green-400 px-2 py-2 text-center text-white rounded-md hover:bg-green-600"
                >
                  Edit
                </Link>
                <h1
                  onClick={() => roleHandler({ id: p._id })}
                  className="w-[9%] bg-red-400 px-2 py-2 text-center text-white rounded-md hover:bg-red-600 cursor-pointer"
                >
                  Delete
                </h1>
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
