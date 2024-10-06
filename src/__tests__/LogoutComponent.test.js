import { render, screen } from '@testing-library/react';
import LogoutComponent from '../components/LogoutComponent';
import '@testing-library/jest-dom';

describe('LogoutComponent', () => {

  // Test to verify the rendering of the logout message
  it('should render the logout message', () => {
    // Render the LogoutComponent
    render(<LogoutComponent />);

    // Assertion: Check if the "You are logged out" message is displayed
    const heading = screen.getByText('You are logged out');
    expect(heading).toBeInTheDocument();

    // Assertion: Check if the "Thank You for Using Our Application." message is displayed
    const thankYouMessage = screen.getByText('Thank You for Using Our Application.');
    expect(thankYouMessage).toBeInTheDocument();
  });

});
