import AuthenticationService from "../service/AuthenticationService";
import React, { Component } from "react";

export const MContext = React.createContext();

class MyProvider extends Component {
    state = {isUserLoggedIn: false}

    componentDidMount() {
        const isLoggedIn = AuthenticationService.isUserLoggedIn();
        this.setState({ isUserLoggedIn: isLoggedIn });
    }

    render() {
        return (
            <MContext.Provider value={{
                state: this.state,
                setIsUserLoggedIn: (value) => this.setState({ isUserLoggedIn: value })
            }}>
                {this.props.children}
            </MContext.Provider>
        )
    }
}

export default MyProvider;