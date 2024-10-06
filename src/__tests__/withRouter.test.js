import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import withRouter from '../components/withRouter';
import '@testing-library/jest-dom';

const DummyComponent = ({ navigation, match }) => {
  return (
    <div>
      <div data-testid="param">{match.params.id}</div>
      <button onClick={() => navigation('/new-path')}>Navigate</button>
    </div>
  );
};

// Wrap the component using WithRouter HOC
const WrappedComponent = withRouter(DummyComponent);

describe('WithRouter HOC', () => {
  it('should pass navigation and match params to the wrapped component', () => {
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={['/dummy/123']}>
        <Routes>
          <Route path="/dummy/:id" element={<WrappedComponent />} />
          <Route path="/new-path" element={<div>New Path</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Verify that match.params.id is passed correctly
    expect(getByTestId('param').textContent).toBe('123');
    
    // Simulate button click to navigate
    fireEvent.click(getByText('Navigate'));

    // Verify that the navigation happens by checking if the new route renders
    expect(getByText('New Path')).toBeInTheDocument();
  });
});
