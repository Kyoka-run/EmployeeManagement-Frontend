pipeline {
    agent any
    
    environment {
        AWS_REGION = 'eu-west-1'
        S3_BUCKET = 'employee-management-frontend-kyoka'
    }
    
    stages {
        // pull codes from GitHub
        stage('Checkout') {
            steps {
                git url: 'https://github.com/Kyoka-run/EmployeeManagement-Frontend', 
                    credentialsId: 'privatekey', 
                    branch: 'main'
            }
        }

        // build react
        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        // delpoye to S3
        stage('Deploy to S3') {
            steps {
                withAWS(credentials: 'aws-credentials', region: env.AWS_REGION) {
                    bat "aws s3 sync build/ s3://${env.S3_BUCKET} --delete"
                }
            }
        }
    }
}