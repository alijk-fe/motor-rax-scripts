export default function (fileInfo) {
  const appJSON = JSON.parse(fileInfo.source);

  appJSON.routes = appJSON.routes.map((route) => {
    let name;
    if (route.name) {
      name = route.name;
    } else if (route.path === '/') {
      name = '';
    } else {
      name = route.path.replace(/\//g, '');
    }
    return {
      ...route,
      name,
    };
  });

  return JSON.stringify(appJSON, null, 2);
}
