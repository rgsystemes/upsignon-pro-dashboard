import React from 'react';
import { ResellerSelector } from './ResellerSelector';

class EditableResellerCell extends React.Component {
  state = {
    isEditing: false,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value || '' });
    }
  }

  toggleEdit = () => {
    this.setState({ isEditing: true });
  };

  handleChange = (newValue) => {
    if (this.props.onChange && newValue !== this.props.value) {
      this.props.onChange(newValue ?? '');
    }
    this.setState({ isEditing: false });
  };

  render() {
    const { value, className, resellers } = this.props;
    const selectedResellerName = resellers.find((r) => r.id === value)?.name;

    if (this.state.isEditing) {
      return (
        <td className={className}>
          <ResellerSelector
            value={this.props.value}
            onChange={this.handleChange}
            resellers={resellers}
          />
        </td>
      );
    }

    return (
      <td
        className={className}
        onClick={this.toggleEdit}
        style={{
          cursor: 'pointer',
        }}
      >
        {selectedResellerName}
      </td>
    );
  }
}

export { EditableResellerCell };
