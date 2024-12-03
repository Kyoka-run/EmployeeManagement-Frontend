import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeApp from '../components/EmployeeApp';

describe('EmployeeApp Component', () => {
  it('should render without crashing', () => {
    // Using MemoryRouter to simulate routing environment
    render(
      <MemoryRouter>
        <EmployeeApp />
      </MemoryRouter>
    );
  });
});
