import React from 'react'

const OrderCard = ({ order }) => {
  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold">Order #{order.id}</h2>
      <p>Status: {order.status}</p>
      <p>Total: ${order.total}</p>
      <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg">
        View Details
      </button>
      <button className="mt-2 bg-red-500 text-white py-2 px-4 rounded-lg">
        Cancel Order
      </button>
    </div>
  )
}

export default OrderCard