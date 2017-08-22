import React from 'react';
import { connect } from 'dva';
import styles from './index.css';

function Dashboard() {
  return (
    <div className={styles.normal}>
      Route Component: Dashboard
    </div>
  );
}

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps)(Dashboard);
