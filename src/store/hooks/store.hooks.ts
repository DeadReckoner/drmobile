import { AppDispatchType, RootStateType } from '@/store/types/store.types';
import { useDispatch, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatchType>();
export const useAppSelector = useSelector.withTypes<RootStateType>();

export const createAppSelector = <TSelected>(
  selector: (_state: RootStateType) => TSelected,
) => selector;
