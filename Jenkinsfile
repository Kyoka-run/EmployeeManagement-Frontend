pipeline {
    agent any
    
    environment {
        AWS_REGION = 'eu-west-1'
        S3_BUCKET = 'employee-management-frontend-kyoka'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/Kyoka-run/EmployeeManagement-Frontend', 
                    credentialsId: 'privatekey', 
                    branch: 'main'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Deploy to S3') {
            steps {
                withAWS(credentials: 'aws-credentials', region: env.AWS_REGION) {
                    bat "aws s3 sync build/ s3://${env.S3_BUCKET} --delete"
                }
            }
        }
    }

    post {
        success {
            echo 'Frontend deployment successful!'
        }
        failure {
            echo 'Frontend deployment failed!'
        }
    }
}