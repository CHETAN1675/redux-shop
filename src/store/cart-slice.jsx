import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {uiActions} from "./ui-slice";

export const sendCartData = createAsyncThunk(
  "cart/sendCartData",
   async (cart, { dispatch, rejectWithValue }) => {
    // Dispatch pending notification before sending
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Sending...",
        message: "Sending cart data!",
      })
   );

    try {
      const response = await fetch(
        "https://redux-shop-data-default-rtdb.firebaseio.com/cart.json",
        {
          method: "PUT",
          body: JSON.stringify({
            items: cart.items,
            totalQuantity: cart.totalQuantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Sending cart data failed!");
      }

      // Retur's a success message
      return "Sent cart data successfully!";
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
    name : 'cart',
    initialState:{
        items:[],
        totalQuantity:0,
        status:null,
    },
    reducers:{
      replaceCart(state,action){
        state.totalQuantity=action.payload.totalQuantity;
        state.items =  action.payload.items||[];
      },
        addItemCart(state,action){
            const newItem = action.payload;
            const existingItem = state.items.find(item=>item.id===newItem.id)
            state.totalQuantity++;

        if (!existingItem) {
        state.items.push({
          id: newItem.id,
          title: newItem.title,
          price: newItem.price,
          quantity: 1,
          totalPrice: newItem.price,
         
        });
      } else {
        existingItem.quantity++;
        existingItem.totalPrice += newItem.price;
      }
      },
     removeItemFromCart(state, action) {
      const id = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      state.totalQuantity--;

      if (existingItem.quantity === 1) {
        state.items = state.items.filter(item => item.id !== id);
      } else {
        existingItem.quantity--;
        existingItem.totalPrice -= existingItem.price;
      }
    },
    },
     extraReducers: (builder) => {
    builder
      .addCase(sendCartData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendCartData.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(sendCartData.rejected, (state, action) => {
        state.status = "failed";
      });
    },
});

export const cartActions = cartSlice.actions;
export default cartSlice.reducer;