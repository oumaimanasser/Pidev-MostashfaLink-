pipeline {
    agent any

    environment {
        SONAR_SCANNER_HOME = tool 'MySonarQubeServer'
    }

    stages {
        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh """
                    ${env.SONAR_SCANNER_HOME}/bin/sonar-scanner \
                      -Dsonar.projectKey=node\
                      -Dsonar.projectName=nodeapp \
                      -Dsonar.projectVersion=1.0 \
                      -Dsonar.sources=.
                """
            }
        }
    }

    post {
        failure {
            echo 'La pipeline a échoué'
            mail to: 'nadrawertani22@gmail.com',
                 subject: "Échec du pipeline: ${currentBuild.fullDisplayName}",
                 body: "Vérifie les logs Jenkins: ${env.BUILD_URL}"
        }
    }
}

