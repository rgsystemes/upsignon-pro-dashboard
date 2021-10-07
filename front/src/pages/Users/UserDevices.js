import React from 'react';

class UserDevices extends React.Component {
  render() {
    console.log(this.props.devices);
    return (
      <div>
        <h3>Devices</h3>
      </div>
    );
  }
}

export { UserDevices };
