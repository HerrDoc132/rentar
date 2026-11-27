import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UsuarioState {
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  } | null;
}

const initialState: UsuarioState = { usuario: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsuario(state, action: PayloadAction<UsuarioState['usuario']>) {
      state.usuario = action.payload;
    },
  },
});

export const { setUsuario } = authSlice.actions;

export const store = configureStore({
  reducer: { auth: authSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
