import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import withRouter from '../components/withRouter'; 
import '@testing-library/jest-dom';

// A dummy component to test withRouter HOC functionality
const DummyComponent = ({ navigation, match }) => {
  return (
    <div>
      {/* Display the match param (id) */}
      <div data-testid="param">{match.params.id}</div>
      {/* Button that triggers navigation */}
      <button onClick={() => navigation('/new-path')}>Navigate</button>
    </div>
  );
};

// Wrap DummyComponent with withRouter HOC to inject routing props
const WrappedComponent = withRouter(DummyComponent);

describe('WithRouter HOC', () => {
  it('should pass navigation and match params to the wrapped component', () => {
    // Render the component using MemoryRouter with an initial entry for "/dummy/123"
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={['/dummy/123']}>
        <Routes>
          {/* Define the routes for testing */}
          <Route path="/dummy/:id" element={<WrappedComponent />} />
          <Route path="/new-path" element={<div>New Path</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check if the match.params.id is passed and displayed correctly
    expect(getByTestId('param').textContent).toBe('123');
    
    // Simulate a click event on the "Navigate" button to trigger navigation
    fireEvent.click(getByText('Navigate'));

    // Check if the navigation to "/new-path" has occurred by verifying if the "New Path" text is rendered
    expect(getByText('New Path')).toBeInTheDocument();
  });
});
