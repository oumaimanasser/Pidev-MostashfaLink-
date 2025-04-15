pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {
        stage('Checkout Code') {
            steps {
                git credentialsId: 'git-creds-id',
                    branch: 'main',
                    url: 'https://github.com/oumaimanasser/Pidev-MostashfaLink-.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Unit Tests') {
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
                withSonarQubeEnv('SonarQubeServer') {
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=MostashfaLink \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000 \
                        -Dsonar.login=$SONAR_TOKEN
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("nadrawertani/mostashfalink:${BUILD_NUMBER}")
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh "docker push nadrawertani/mostashfalink:${BUILD_NUMBER}"
                sh "docker tag nadrawertani/mostashfalink:${BUILD_NUMBER} nadrawertani/mostashfalink:latest"
                sh "docker push nadrawertani/mostashfalink:latest"
            }
        }

        stage('Grafana Monitoring') {
            steps {
                script {
                    def status = currentBuild.currentResult == 'SUCCESS' ? 1 : 0
                    sh """
                        cat <<EOF | curl --data-binary @- http://localhost:9090/metrics/job/${env.JOB_NAME}/build/${env.BUILD_NUMBER}
                        # TYPE jenkins_build_status gauge
                        jenkins_build_status{job="${env.JOB_NAME}",build="${env.BUILD_NUMBER}"} ${status}
                        EOF
                    """
                }
            }
        }
    }

    post {
        success {
            mail to: 'werteninadra@gmail.com',
                 subject: "✅ Pipeline réussie : ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "La pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} a été exécutée avec succès.\nConsultez les logs : ${env.BUILD_URL}"
            echo 'Pipeline exécutée avec succès'
        }
        failure {
            mail to: 'werteninadra@gmail.com',
                 subject: "❌ Échec de la pipeline : ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "La pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} a échoué.\nConsultez les logs : ${env.BUILD_URL}"
            echo 'La pipeline a échoué'
        }
    }
}
