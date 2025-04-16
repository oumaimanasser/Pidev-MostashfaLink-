pipeline {
    agent any

    

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
steps{ 
script {   
def scannerHome = tool 'MySonarQubeServer' 
withSonarQubeEnv { 
sh "${scannerHome}/bin/sonar-scanner" 
} 
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

