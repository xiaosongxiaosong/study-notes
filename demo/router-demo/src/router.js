// import React from 'react';
// import PropTypes from 'prop-types';
// import { Router, Route } from 'dva/router';
// import { IndexPage, ErrorPage, Client, Dashboard, Project } from './routes';

// function RouterConfig({ history }) {
//   return (
//     <Router history={history}>
//       <Route path="/" component={IndexPage} />
//       <Route path="/client" component={Client}>
//         <Route path="project" component={Project} />
//         <Route path="*" component={Dashboard} />
//       </Route>
//       <Route path="*" component={ErrorPage} />
//     </Router>
//   );
// }

// export default RouterConfig;

import React from 'react';
import { Router } from 'dva/router';

const registerModel = (app, model) => {
  if (!(app._models.filter(m => m.namespace === model.namespace).length === 1)) {
    app.model(model);
  }
};

function RouterConfig({ history, app }) {
  const routes = [
    {
      path: '/',
      name: 'IndexPage',
      getComponent(nextState, cb) {
        require.ensure([], (require) => {
          cb(null, require('./routes/IndexPage'));
        });
      },
    },
    {
      path: '/client',
      name: 'Client',
      getComponent(nextState, cb) {
        require.ensure([], (require) => {
          registerModel(app, require('./models/client'));
          cb(null, require('./routes/Client/Client'));
        });
      },
      childRoutes: [
        {
          path: 'dashboard',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              // registerModel(app, require('./models/dashboard'));
              cb(null, require('./routes/Client/Dashboard'));
            }, 'Dashboard');
          },
        },
        {
          path: 'project',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/project'));
              cb(null, require('./routes/Client/Project'));
            }, 'Project');
          },
        },
      ],
    },
    {
      path: '*',
      name: 'ErrorPage',
      getComponent(nextState, cb) {
        require.ensure([], (require) => {
          cb(null, require('./routes/ErrorPage'));
        });
      },
    },
  ];

  return <Router history={history} routes={routes} />;
}

export default RouterConfig;
