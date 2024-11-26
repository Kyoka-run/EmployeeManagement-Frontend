import React from "react";
import { Routes, Route } from "react-router-dom";
import ListEmployeesComponent from "./ListEmployeesComponent.jsx";
import EmployeeComponent from "./EmployeeComponent.jsx";
import LoginComponent from './LoginComponent.jsx';
import LogoutComponent from './LogoutComponent.jsx';
import MenuComponent from './MenuComponent.jsx';
import MyProvider from './MyProvider.jsx';
import RegisterComponent from './RegisterComponent.jsx';
import ListProjectsComponent from "./ListProjectsComponent.jsx";
import ProjectComponent from "./ProjectComponent.jsx";

function EmployeeApp() {
  return (
    <>
      <MyProvider>
        <MenuComponent />
        <Routes>
          <Route path="/" element={<LoginComponent />} />
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<RegisterComponent />} />
          <Route path="/logout" element={<LogoutComponent />} />
          <Route path="/employees" element={<ListEmployeesComponent />} />
          <Route path="/employees/:id" element={<EmployeeComponent />} />
          <Route path="/projects" element={<ListProjectsComponent />} />
          <Route path="/projects/:id" element={<ProjectComponent />} />
        </Routes>
      </MyProvider>
    </>
  );
}

export default EmployeeApp;
