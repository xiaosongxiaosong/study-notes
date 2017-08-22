import React from 'react';
import { connect } from 'dva';
import styles from './Client.css';

class Client extends React.Component {
  render() {
    return (
      <div className={styles.normal}>
        Route Component: Client
        <div>{this.props.children}</div>
      </div>
    );
  }
}
// function Client({ children }) {
//   return (
//     <div className={styles.normal}>
//       Route Component: Client
//       <div>{children}</div>
//     </div>
//   );
// }

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps)(Client);
