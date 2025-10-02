import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TicketPriority, TicketStatus } from "@data";

export interface TicketingState {
  status?: TicketStatus;
  search?: string;
  labels: string[];
  priority?: TicketPriority;
  page: number;
}

const initialState: TicketingState = {
  labels: [],
  page: 1,
};

export const ticketingSlice = createSlice({
  name: "ticketing",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<TicketStatus | undefined>) {
      state.status = action.payload;
      state.page = 1;
    },
    toggleLabel(state, action: PayloadAction<string>) {
      const label = action.payload;
      if (state.labels.includes(label)) {
        state.labels = state.labels.filter((existing) => existing !== label);
      } else {
        state.labels = [...state.labels, label];
      }
      state.page = 1;
    },
    setSearch(state, action: PayloadAction<string | undefined>) {
      state.search = action.payload;
      state.page = 1;
    },
    setPriority(state, action: PayloadAction<TicketPriority | undefined>) {
      state.priority = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    clearFilters(state) {
      state.status = undefined;
      state.labels = [];
      state.search = undefined;
      state.priority = undefined;
      state.page = 1;
    },
  },
});

export const { setStatus, toggleLabel, setSearch, setPriority, setPage, clearFilters } = ticketingSlice.actions;

export default ticketingSlice.reducer;
