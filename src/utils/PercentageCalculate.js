function calculateDiscountedPrice(mrp, discountPercent) {
  if (!mrp || !discountPercent) return mrp;
  const discount = (mrp * discountPercent) / 100;
  return Math.round(mrp - discount); 
}

export default calculateDiscountedPrice;