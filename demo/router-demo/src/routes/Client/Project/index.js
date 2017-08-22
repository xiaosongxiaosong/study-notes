import React from 'react';
import { connect } from 'dva';
import styles from './index.css';

function Project() {
  return (
    <div className={styles.normal}>
      Route Component: Project
    </div>
  );
}

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps)(Project);
