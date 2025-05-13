pipeline {
    agent any

    environment {
        SONAR_SCANNER_HOME = tool 'MySonarQubeServer'
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {
        stage('Install dependencies') {
            steps {
                dir('fdashboard-main') {
                    sh 'npm install'
                }
            }
        }

        stage('Run tests') {
            steps {
                dir('frontend') {
                    sh 'npm test'
                }
            }
        }

        stage('Build application') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('frontend') {
                    sh """
                        ${env.SONAR_SCANNER_HOME}/bin/sonar-scanner \
                          -Dsonar.projectKey=nodeapp \
                          -Dsonar.projectName=nodeapp \
                          -Dsonar.projectVersion=1.0 \
                          -Dsonar.sources=. \
                          -Dsonar.login=${env.SONAR_TOKEN} \
                          -Dsonar.host.url=http://localhost:9000
                    """
                }
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
