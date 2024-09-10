import { create } from "zustand";
import { round2 } from "../utils";
import { OrderItem } from "../models/OderModel";
import { persist } from "zustand/middleware";

type Cart = {
  items: OrderItem[]
  itemsPrice: number
  taxPrice: number
  shippingPrice: number
  totalPrice: number
}

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: 0,
  shippingPrice: 0,
  totalPrice: 0,
}

export const cartStore = create<Cart>()(
  persist(() => initialState, {
    name: 'cartStore',
  })
)

export default function useCartService() {
  const { items, itemsPrice, taxPrice, shippingPrice, totalPrice } = cartStore()
  return {
    items, 
    itemsPrice, 
    taxPrice, 
    shippingPrice, 
    totalPrice,
    increase: (item: OrderItem) => {
      const exist = items.find((x) => x.slug === item.slug)
      const updateCartItems = exist
        ? items.map((x) => 
          x.slug === item.slug ? { ...exist, qty: exist.qty + 1 } : x
        ) : [...items, {...item, qty: 1}]
        const { itemsPrice, shippingPrice, taxPrice, totalPrice } = 
        calcPrice(updateCartItems)
        cartStore.setState({
          items: updateCartItems,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        })
    },
    decrease: (item: OrderItem) => {
      const updateCartItems = items.map((x: OrderItem) => {
        if(x.slug === item.slug){
          if(x.qty === 1) {
            return null;
          } else {
            return {...x, qty: x.qty - 1};
          }
        }
        return x;
      }).filter((x: OrderItem | null) => x !== null)
      const {
        itemsPrice, 
        shippingPrice,
        taxPrice,
        totalPrice
      } =
      calcPrice(updateCartItems)
      cartStore.setState({
        items: updateCartItems,
        itemsPrice,
        taxPrice,
        totalPrice,
      })
    },
  }
}

const calcPrice = (items: OrderItem[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.qty, 0)
  ),
  shippingPrice = round2(itemsPrice > 100 ? 0 : 100)
  const taxPrice: number = round2(Number(0.5 * itemsPrice))
  const totalPrice: number = round2(itemsPrice + shippingPrice + taxPrice)

  return { itemsPrice, shippingPrice, taxPrice, totalPrice}
}