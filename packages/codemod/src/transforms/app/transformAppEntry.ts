export default function (fileInfo, api) {
  const { jscodeshift: j } = api;
  let appLaunchOptions = ''; let appLaunchBody = '{}';
  let appShowOptions = ''; let appShowBody = '{}'; let appShareBody = '{}';
  let appErrorOptions = ''; let
    appErrorBody = '{}';
  const root = j(fileInfo.source);
  const depecratedApis = ['useAppLaunch', 'useAppShow', 'useAppShare', 'useAppError'];
  // cache appLaunch code
  const appLaunchExpressions = root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'useAppLaunch',
    },
  });
  if (appLaunchExpressions.__paths.length && appLaunchExpressions.__paths[0].value.arguments[0].params && appLaunchExpressions.__paths[0].value.arguments[0].params.length) {
    appLaunchOptions = appLaunchExpressions.__paths[0].value.arguments[0].params[0].name;
  }
  if (appLaunchExpressions.__paths.length && appLaunchExpressions.__paths[0].value.arguments[0].body) {
    appLaunchBody = j(appLaunchExpressions.__paths[0].value.arguments[0].body).toSource();
  }
  // cache appShow code
  const appShowExpressions = root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'useAppShow',
    },
  });
  if (appShowExpressions.__paths.length && appShowExpressions.__paths[0].value.arguments[0].params && appShowExpressions.__paths[0].value.arguments[0].params.length) {
    appShowOptions = appShowExpressions.__paths[0].value.arguments[0].params[0].name;
  }
  if (appShowExpressions.__paths.length && appShowExpressions.__paths[0].value.arguments[0].body) {
    appShowBody = j(appShowExpressions.__paths[0].value.arguments[0].body).toSource();
  }
  // cache appShare code
  const appShareExpressions = root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'useAppShare',
    },
  });
  if (appShareExpressions.__paths.length && appShareExpressions.__paths[0].value.arguments[0].body) {
    appShareBody = j(appShareExpressions.__paths[0].value.arguments[0].body).toSource();
  }
  // cache appError code
  const appErrorExpressions = root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'useAppError',
    },
  });
  if (appErrorExpressions.__paths.length && appErrorExpressions.__paths[0].value.arguments[0].params && appErrorExpressions.__paths[0].value.arguments[0].params.length) {
    appErrorOptions = appErrorExpressions.__paths[0].value.arguments[0].params.map((n) => n.name).join(', ');
  }
  if (appErrorExpressions.__paths.length && appErrorExpressions.__paths[0].value.arguments[0].body) {
    appErrorBody = j(appErrorExpressions.__paths[0].value.arguments[0].body).toSource();
  }

  // remove depecrated api import
  depecratedApis.map((name) => {
    root.find(j.ImportSpecifier, {
      imported: {
        type: 'Identifier',
        name,
      },
    }).remove();
    return '';
  });

  return root
    .find(j.ExpressionStatement)
    .forEach((path) => {
      if (path.value.expression.callee && depecratedApis.includes(path.value.expression.callee.name)) {
        path.prune();
      } else if (path.value.expression.callee && path.value.expression.callee.name === 'runApp') {
        path.value.expression.arguments = [j.identifier(`{
  app: {
    onLaunch(${appLaunchOptions}) ${appLaunchBody},
    onShow(${appShowOptions}) ${appShowBody},
    onHide() {},
    onShareAppMessage() ${appShareBody},
    onError(${appErrorOptions}) ${appErrorBody},
  },
}`)];
      }
    }).toSource();

  // ast
  //   .find(j.ImportDeclaration)
  //   .filter((path) => path.value.source.value === './app.json')
  //   .forEach((path) => {
  //     path.prune();
  //   });

  // ast
  //   .find(j.Identifier)
  //   .filter((path) => path.value.name === 'appConfig')
  //   .remove();

  // ast
  //   .find(j.callExpression)
  //   .find((path) => path.callee.name === 'runApp')
  //   .callExpression(
  //     j.identifier('runApp'),
  //     [j.identifier('{}')],
  //   );


  // console.log('ast', ast)
}
