USER
{
  name,
  mobile,
  password,
  addresses,
  wishlist
}

PRODUCT
{
  name,
  description,
  price,
  stock,
  category,
  brand,
  images,
  ratings
}



CART
{
  user,
  products
}


ORDER
{
  user,
  products,
  amount,
  payment,
  status
}

REVIEW
{
  user,
  product,
  rating,
  comment
}