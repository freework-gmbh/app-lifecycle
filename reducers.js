const initialState = {
  version: null,
  build: null,
};

const appLifecycleInfoReducer = (state = initialState, action) => {
  if (action.type === 'APP_LIFECYCLE_INFO_SAVE') {
    return { ...action.payload.appLifecycleInfo };
  }

  return state;
};

export default appLifecycleInfoReducer;
