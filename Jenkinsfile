pipeline {
    agent any

    environment {
        SONAR_SCANNER_HOME = tool 'MySonarQubeServer' // Assure-toi que c'est bien installé dans Jenkins (Manage Jenkins > Global Tool Configuration)
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

        sh """
${env.SONAR_SCANNER_HOME}/bin/sonar-scanner \
  -Dsonar.projectKey=MyProjectKey \
  -Dsonar.projectName=MyProject \
  -Dsonar.projectVersion=1.0 \
  -Dsonar.sources=.
"""

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

