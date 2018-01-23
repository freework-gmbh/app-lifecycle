import VersionNumber from 'react-native-version-number';
import _ from 'lodash';

import { track, flush } from '../common/analytics';
import {
  APPLICATION_INSTALLED,
  APPLICATION_UPDATED,
  APPLICATION_OPENED,
} from '../common/tracking/EventNames';

const appWillEnterForeground = (prevAppState, nextAppState) => {
  if (!prevAppState) {
    return false;
  }

  const inBackground = isBackgroundAppState(prevAppState);

  return inBackground && nextAppState === 'active';
};

const trackAppOpen = (current, additionalData) => {
  const data = {
    version: current.version,
    build: current.build,
  };

  track(APPLICATION_OPENED, { ...data, ...additionalData });
};

const trackAppInstall = current => {
  const data = {
    version: current.version,
    build: current.build,
  };

  track(APPLICATION_INSTALLED, data);
};

const trackAppUpdate = (previous, current) => {
  const data = {
    previous_version: previous.version,
    previous_build: previous.build,
    version: current.version,
    build: current.build,
  };

  track(APPLICATION_UPDATED, data);
};

const getPreviousVersion = info => info && info.version;
const getPreviousBuild = info => info && info.build;

const getPrevious = info => ({
  version: getPreviousVersion(info),
  build: getPreviousBuild(info),
});

const trackAppInstallOrUpdate = (
  appLifecycleInfo,
  current,
  updateAppLifecycleInfo,
) => {
  const previous = getPrevious(appLifecycleInfo);

  if (!previous.build) {
    trackAppInstall(current);
  } else {
    trackAppUpdate(previous, current);
  }

  updateAppLifecycleInfo(current);
};

const getCurrent = () => ({
  version: VersionNumber.appVersion,
  build: VersionNumber.buildVersion,
});

const isNewVersion = (appLifecycleInfo, current) =>
  !_.isEqual(appLifecycleInfo, current);

const handleAppStateChange = (
  appLifecycleInfo,
  prevAppState,
  nextAppState,
  updateAppLifecycleInfo,
) => {
  const current = getCurrent();

  if (nextAppState !== 'active') return;

  if (isNewVersion(appLifecycleInfo, current)) {
    trackAppInstallOrUpdate(appLifecycleInfo, current, updateAppLifecycleInfo);
    trackAppOpen(current, { from_background: false });
  } else {
    const enteredForeground = appWillEnterForeground(
      prevAppState,
      nextAppState,
    );
    trackAppOpen(current, { from_background: enteredForeground });
  }

  flush();
};

const isBackgroundAppState = appState => appState.match(/inactive|background/);

const handleGoingToBackground = (prevAppState, nextAppState) => {
  if (prevAppState !== 'active') return;

  if (isBackgroundAppState(nextAppState)) {
    flush();
  }
};

export default { handleAppStateChange, handleGoingToBackground };
