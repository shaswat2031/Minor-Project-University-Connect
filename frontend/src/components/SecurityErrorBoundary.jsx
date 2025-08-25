import { Component } from 'react';
import PropTypes from 'prop-types';

class SecurityErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Security component error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 p-4 bg-red-100 rounded">
          Face detection failed to initialize. Please refresh the page.
        </div>
      );
    }

    return this.props.children;
  }
}

SecurityErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SecurityErrorBoundary;
