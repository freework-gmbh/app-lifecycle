export const saveAppLifecycleInfo = appLifecycleInfo => ({
  type: 'APP_LIFECYCLE_INFO_SAVE',
  payload: {
    appLifecycleInfo,
  },
});

export default { saveAppLifecycleInfo };
