import React from 'react';
import { Router, Route } from 'dva/router';
import { IndexPage, ErrorPage, Client, Dashboard, Project } from './routes';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={IndexPage} />
      <Route path="/client" component={Client}>
        <Route path="project" component={Project} />
        <Route path="*" component={Dashboard} />
      </Route>
      <Route path="*" component={ErrorPage} />
    </Router>
  );
}

export default RouterConfig;
