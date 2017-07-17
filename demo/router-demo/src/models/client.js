import { routerRedux } from 'dva/router';

export default {
  namespace: 'client',
  state: {},
  reducers: {},
  effects: {
    *jump2default({ payload }, { put }) {
      yield put(routerRedux.replace({ pathname: '/client/dashboard' }));
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/client' || pathname === '/client/') {
          dispatch({ type: 'jump2default' });
        }
      });
    },
  },
};
