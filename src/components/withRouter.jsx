import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const withRouter = (Component) => {
    return (props) => {
        const navigation = useNavigate();
        const match  = {params: useParams()};
        return <Component match={match} navigation={navigation} {...props} />
    }
}

export default withRouter;