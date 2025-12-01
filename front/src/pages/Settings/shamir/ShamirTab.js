import React from 'react';
import { NewShamirConfig } from './NewShamirConfig';

// Props : setIsLoading
export class ShamirTab extends React.Component {
  state = {};

  render() {
    return (
      <div style={{ marginTop: 20 }}>
        <NewShamirConfig setIsLoading={this.props.setIsLoading} />
      </div>
    );
  }
}
