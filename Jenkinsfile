pipeline {
    agent {
        docker {
            image 'node:lts-buster-slim' 
            args '-p 3007:3007' 
        }
    }
    environment {
        CI = 'true' 
    }
    stages {
        stage('Build') { 
            steps {
                sh 'npm install' 
            }
        }
        stage('Test') {
            steps {
                sh 'yarn test-jenkins'
            }
            post {
                always {
                    step([$class: 'CoberturaPublisher', coberturaReportFile: 'coverage/jest/cobertura-coverage.xml'])
                }
            }
        }
        // stage('Production') {
        //     steps {
        //         withAWS(region:'Bulgaria', credentials:'1k2sea34s') {
        //             s3Delete(bucket: 'estate app server', path:'**/*')
        //             s3Upload(bucket: 'estate app server', workingDir:'build', includePathPattern:'**/*');
        //         }
        //     }
        // }
    }
}