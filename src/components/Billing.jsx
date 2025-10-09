import React, { useState } from 'react';

const Billing = () => {
  const [barcode, setBarcode] = useState('');
  const [products, setProducts] = useState([]);
  const [paymentMode, setPaymentMode] = useState('Cash');

  const addProduct = () => {
    if (!barcode) return;
    const product = productDB[barcode];
    if (!product) {
      alert('Product not found!');
      return;
    }

    const existing = products.find(p => p.barcode === barcode);
    if (existing) {
      setProducts(products.map(p => p.barcode === barcode ? { ...p, quantity: p.quantity + 1 } : p));
    } else {
      setProducts([...products, { ...product, barcode, quantity: 1 }]);
    }
    setBarcode('');
  };

  const updateQuantity = (barcode, quantity) => {
    setProducts(products.map(p => p.barcode === barcode ? { ...p, quantity: Number(quantity) } : p));
  };

  const deleteProduct = (barcode) => {
    setProducts(products.filter(p => p.barcode !== barcode));
  };

  const totalAmount = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

  return (
    <div className='h-screen w-full bg-zinc-800 px-10 py-5 flex flex-col gap-y-5'>
      <div className="flex bg-white px-4 py-4 gap-x-4 rounded-lg items-center font-bold text-lg">
        Billing
      </div>

      <div className="flex gap-x-2">
        <input
          type="text"
          placeholder="Enter barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="px-3 py-2 rounded-md flex-1 bg-white outline-none"
        />
        <button onClick={addProduct} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Add
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.barcode} className="text-center border-t">
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">{p.price}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min="1"
                    value={p.quantity}
                    onChange={(e) => updateQuantity(p.barcode, e.target.value)}
                    className="w-16 px-2 py-1 text-center border rounded"
                  />
                </td>
                <td className="px-4 py-2">{p.price * p.quantity}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteProduct(p.barcode)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 bg-white px-4 py-4 rounded-lg">
        <div className="flex items-center gap-x-2">
          <label className="font-semibold">Payment Mode:</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option>Cash</option>
            <option>UPI</option>
          </select>
        </div>
        <div className="font-bold text-lg">Total: ₹{totalAmount}</div>
      </div>
    </div>
  );
};

export default Billing;
