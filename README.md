# Employee Management System - Spring Boot & React & MySQL

## 🎯 Project Overview
The Employee Management System is a comprehensive full-stack web application for managing employees and projects, featuring secure user authentication, role-based authorization, and real-time data management. Built with Spring Boot, React, and MySQL.

The project consists of two main repositories:
- Backend Repository: [`EmployeeManagement-Backend`][backend]
- Frontend Repository: [`EmployeeManagement-Frontend`][frontend]

The application is deployed and accessible through AWS:
[`Live Demo`][demo]

[backend]: https://github.com/Kyoka-run/EmployeeManagement-Backend
[frontend]: https://github.com/Kyoka-run/EmployeeManagement-Frontend  
[demo]: http://employee-management-frontend-kyoka.s3-website-eu-west-1.amazonaws.com

## ✨ Key Features

### User Authentication & Authorization
- **JWT-based authentication**
- **Role-based access control (ADMIN, EMPLOYEE_MANAGER, PROJECT_MANAGER, GUEST)**
- **Secure password hashing with BCrypt**

### Employee & Project Management
- **CRUD operations**
- **Employee & Project details**
- **Bulk operations**
- **Real-time search and filtering**

### Advanced Features
- **Responsive Material-UI interface**
- **Error handling and validation**
- **Success/Error notifications**

## ⚙️ Technologies Stack

### Back-end
- **Framework:** Spring Boot 2.7.2
- **Security:** Spring Security with JWT
- **Database:** MySQL with JPA/Hibernate
- **API Documentation:** Springdoc OpenAPI (Swagger)
- **Testing:** JUnit, Mockito
- **Build Tool:** Maven

### Front-end
- **Framework:** React (Functional components with Hooks)
- **UI Components:** Material-UI (MUI)
- **HTTP Client:** Axios
- **Form Handling:** Formik
- **Testing:** React Testing Library, Jest
  
### Development
- **Containerization:** Docker
- **Version Control:** Git
- **API Testing:** Swagger UI
- **CI/CD:** Jenkins

## 📦 Installation & Setup

### Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8.0+
  
### Backend Setup
1. Clone the repository:
```bash
git clone https://github.com/Kyoka-run/EmployeeManagement-Project.git
```

2. Set up the MySQL database:
```sql
CREATE DATABASE employee_management;
```

3. Update the application.properties file with your MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/employee_management
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

4. Run the application

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure API endpoint:
```javascript
// Update API_URL in service files if needed
const API_URL = 'http://localhost:8080';
```

3. Start development server:
```bash
npm start
```

## 🧪 Testing

### Back-end
```bash
# Run all tests
mvn test

# Generate coverage report
mvn jacoco:report
```

### Front-end
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- LoginComponent.test.js
```
  
## 📊 Swagger API Tests

Swagger UI available at:
```
http://localhost:8080/swagger-ui.html
```

## 🛠 Application Screenshots

### Login Page 
![login](https://github.com/user-attachments/assets/953356be-0021-42a1-b525-0a9098eceded)

### Logout Page 
![logout](https://github.com/user-attachments/assets/ae51b60b-21b2-47c2-a19b-cb995e45b874)

### Register Page 
![register](https://github.com/user-attachments/assets/8afd65a6-3db1-43db-850b-fbe3d49c6118)

### Employee List Page 
![employee list](https://github.com/user-attachments/assets/09d52193-7fbb-455a-a6c9-f4114d99f854)

### Project List Page 
![project list](https://github.com/user-attachments/assets/1750b88d-7c16-4bf2-a296-788b42d50acc)

### Dashboard Page 
![dashboard](https://github.com/user-attachments/assets/ccd6ea91-701f-46c8-ab91-34f253b104aa)

### Update Employee Page 
![update employee](https://github.com/user-attachments/assets/00a83f51-828e-40f2-80c9-9e0b7437095b)

### Create Project Page 
![create project](https://github.com/user-attachments/assets/5122b5b1-9748-4d30-bb7f-7b0cd4cff0da)

### Search Function Page 
![search function](https://github.com/user-attachments/assets/c7c23662-7fc3-4eee-a600-df2880793d0d)

### Bulk Delete Page 
![bulk delete](https://github.com/user-attachments/assets/909b8bb7-ca4a-47fe-a5cd-d9e30b52efd0)
